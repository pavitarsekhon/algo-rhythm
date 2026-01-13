import requests
import psycopg2
import re

DB_CONFIG = {
    "host": "localhost",
    "database": "algorhythm_db",
    "user": "postgres",
    "password": "postgres",
    "port": 5433
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None


def fetch_leetcode_dataset(offset=0, length=100):
    base_url = "https://datasets-server.huggingface.co/rows"

    params = {
        "dataset": "newfacade/LeetCodeDataset",
        "config": "default",
        "split": "train",
        "offset": offset,
        "length": length
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()

        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"Error calling API: {e}")
        return None

def extract_function_name(starter_code):
    if not starter_code:
        return None

    class_method_pattern = r'def\s+(\w+)\s*\(self'
    match = re.search(class_method_pattern, starter_code)
    if match:
        func_name = match.group(1)
        if func_name != '__init__':
            return func_name

    python_pattern = r'def\s+(\w+)\s*\('
    match = re.search(python_pattern, starter_code)
    if match:
        func_name = match.group(1)
        if func_name != '__init__':
            return func_name

    return None

def extract_questions(response):
    if not response or "rows" not in response:
        return []

    questions = []

    for row in response["rows"]:
        question_data = row.get("row", {})

        prompt = question_data.get("problem_description")
        difficulty = question_data.get("difficulty").upper()
        tags = question_data.get("tags", [])
        if isinstance(tags, list):
            topics = "|".join(tags)
        else:
            topics = str(tags) if tags else ""
        input_output_extracted = question_data.get("input_output")
        input_output_pairs = []
        for i in input_output_extracted:
            input_text = i["input"]
            expected_output = i["output"]
            input_output_pairs.append([input_text, expected_output])
        function_name = extract_function_name(question_data.get("starter_code"))
        if function_name is not None:
            extracted = {
                "prompt": clean_prompt(prompt),
                "difficulty": difficulty,
                "topics": topics,
                "input_output_pairs": input_output_pairs,
                "starter_code": question_data.get("starter_code"),
                "function_name": function_name
            }

            questions.append(extracted)

    return questions

def clean_prompt(prompt_text):

    if isinstance(prompt_text, list):
        prompt_text = ' '.join(prompt_text)

    cleaned = prompt_text.replace('\xa0', ' ')

    cleaned = cleaned.replace('\\n', '\n')

    if cleaned.startswith('Prompt:'):
        cleaned = cleaned[len('Prompt:'):].strip()

    lines = cleaned.split('\n')
    cleaned_lines = [line.strip() for line in lines]
    cleaned = '\n'.join(cleaned_lines)

    while '\n\n\n' in cleaned:
        cleaned = cleaned.replace('\n\n\n', '\n\n')

    return cleaned

def insert_question(conn, question_data):
    cursor = conn.cursor()

    try:
        insert_question_sql = """
                              INSERT INTO question (topics, difficulty, prompt, function_name, starter_code)
                              VALUES (%s, %s, %s, %s, %s)
                                  RETURNING id \
                              """

        cursor.execute(insert_question_sql, (
            question_data['topics'],
            question_data['difficulty'],
            question_data['prompt'],
            question_data['function_name'],
            question_data['starter_code']
        ))

        question_id = cursor.fetchone()[0]

        insert_iopair_sql = """
                            INSERT INTO iopair (input_text, expected_output, question_id)
                            VALUES (%s, %s, %s) \
                            """

        io_pairs = [
            (
                pair[0],
                pair[1],
                question_id
            )
            for pair in question_data['input_output_pairs']
        ]

        cursor.executemany(insert_iopair_sql, io_pairs)

        conn.commit()
        return question_id

    except Exception as e:
        conn.rollback()
        print(f"Error inserting question: {e}")
        return None
    finally:
        cursor.close()

def insert_questions_batch(conn, questions):
    inserted_count = 0
    failed_count = 0

    for idx, question in enumerate(questions, 1):
        print(f"Inserting question {idx}/{len(questions)}...")

        question_id = insert_question(conn, question)

        if question_id:
            inserted_count += 1
            print(f"  [OK] Inserted question ID: {question_id} with {len(question['input_output_pairs'])} IO pairs")
        else:
            failed_count += 1
            print(f"  [FAIL] Failed to insert question")  # FIX: Use [FAIL] instead of ✗

    return inserted_count, failed_count

def main():
    print("Connecting to database...")
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to database")
        return

    print("Connected to database successfully!")

    try:
        print("\nFetching dataset...")
        response = fetch_leetcode_dataset(offset=0, length=100)

        if response:
            questions = extract_questions(response)
            print(f"Extracted {len(questions)} questions with IO pairs")

            if questions:

                print("\n=== First Question Preview ===")
                print(f"Difficulty: {questions[0]['difficulty']}")
                print(f"Topics: {questions[0]['topics']}")
                print(f"Function: {questions[0]['function_name']}")
                print(f"IO Pairs: {len(questions[0]['input_output_pairs'])}")

                inserted, failed = insert_questions_batch(conn, questions)
                print(f"\n=== Summary ===")
                print(f"Inserted: {inserted}")
                print(f"Failed: {failed}")

        else:
            print("Failed to fetch data from API")

    finally:
        conn.close()
        print("\nDatabase connection closed")

if __name__ == "__main__":
    main()
