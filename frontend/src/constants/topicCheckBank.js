const GENERIC_TOPIC_CHECKS = [
    { statement: "An algorithm should always produce the same output for the same valid input.", isTrue: true },
    { statement: "Time complexity describes how runtime grows as input size grows.", isTrue: true },
    { statement: "A syntax error means your code logic is always correct.", isTrue: false },
    { statement: "Edge cases are inputs near constraints that can break assumptions.", isTrue: true },
    { statement: "You should ignore failed tests if most tests pass.", isTrue: false }
];

const TOPIC_CHECK_BANK = {
    array: [
        { statement: "Arrays use index-based access.", isTrue: true },
        { statement: "Accessing an array element by index is usually O(1).", isTrue: true },
        { statement: "Array length changes never affect performance.", isTrue: false },
        { statement: "Out-of-bounds indexing can cause runtime issues.", isTrue: true }
    ],
    string: [
        { statement: "Strings are sequences of characters.", isTrue: true },
        { statement: "String comparisons should ignore case by default.", isTrue: false },
        { statement: "Trimming whitespace can change program output.", isTrue: true },
        { statement: "String slicing is useful for parsing input.", isTrue: true }
    ],
    hashmap: [
        { statement: "Hash maps are good for fast key lookup.", isTrue: true },
        { statement: "Hash maps always keep keys sorted.", isTrue: false },
        { statement: "Hash collisions can happen.", isTrue: true },
        { statement: "A missing key should be handled safely.", isTrue: true }
    ],
    stack: [
        { statement: "Stacks follow last-in, first-out order.", isTrue: true },
        { statement: "A stack pop removes the oldest element.", isTrue: false },
        { statement: "Stacks are often used in parsing and DFS.", isTrue: true },
        { statement: "You should pop from an empty stack without checks.", isTrue: false }
    ],
    queue: [
        { statement: "Queues follow first-in, first-out order.", isTrue: true },
        { statement: "Queue dequeue removes the newest element first.", isTrue: false },
        { statement: "Queues are useful for breadth-first search.", isTrue: true },
        { statement: "Queue operations can support task scheduling.", isTrue: true }
    ],
    tree: [
        { statement: "A tree is a hierarchical data structure.", isTrue: true },
        { statement: "Binary search tree in-order traversal is always random order.", isTrue: false },
        { statement: "Recursion is commonly used for tree traversal.", isTrue: true },
        { statement: "Tree height can impact operation cost.", isTrue: true }
    ],
    recursion: [
        { statement: "Recursive solutions need a base case.", isTrue: true },
        { statement: "Recursion cannot be converted to iteration.", isTrue: false },
        { statement: "Deep recursion can cause stack overflow.", isTrue: true },
        { statement: "Each recursive call should move toward termination.", isTrue: true }
    ],
    dp: [
        { statement: "Dynamic programming reuses solutions to subproblems.", isTrue: true },
        { statement: "Memoization stores computed results.", isTrue: true },
        { statement: "DP only works for sorting questions.", isTrue: false },
        { statement: "State definition is central in DP design.", isTrue: true }
    ]
};

const TOPIC_ALIASES = {
    arrays: "array",
    list: "array",
    lists: "array",
    strings: "string",
    hash: "hashmap",
    map: "hashmap",
    maps: "hashmap",
    dictionary: "hashmap",
    dictionaries: "hashmap",
    stacks: "stack",
    queues: "queue",
    trees: "tree",
    recursive: "recursion",
    dynamic: "dp"
};

const normalizeTopic = (topic) => {
    const raw = (topic || "").trim().toLowerCase();
    if (!raw) {
        return "";
    }

    const firstWord = raw.split(/\s+/)[0];
    const compact = firstWord.replace(/[^a-z]/g, "");
    return TOPIC_ALIASES[compact] || compact;
};

export const buildTopicCheckQuestions = (topic, questionId, count = 3) => {
    const normalized = normalizeTopic(topic);
    const bank = TOPIC_CHECK_BANK[normalized] || GENERIC_TOPIC_CHECKS;

    if (bank.length <= count) {
        return bank.map((item, index) => ({ ...item, id: `${normalized || "generic"}-${index}` }));
    }

    const numericId = Number(questionId) || 0;
    const start = Math.abs((numericId * 7) + (normalized.length * 13)) % bank.length;

    const selected = [];
    for (let offset = 0; offset < bank.length && selected.length < count; offset += 1) {
        selected.push(bank[(start + offset) % bank.length]);
    }

    return selected.map((item, index) => ({ ...item, id: `${normalized || "generic"}-${start + index}` }));
};

