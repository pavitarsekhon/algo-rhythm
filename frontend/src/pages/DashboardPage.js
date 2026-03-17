import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Badge,
    Box,
    Button,
    Container,
    Flex,
    Grid,
    Heading,
    HStack,
    Progress,
    SimpleGrid,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import { getUserProfile } from "../api/userApi";

function DashboardPage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredSegment, setHoveredSegment] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        getUserProfile()
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch profile:", err);
                setLoading(false);
            });
    }, [navigate]);

    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: "#10b981",
            medium: "#f59e0b",
            hard: "#ef4444"
        };
        return colors[difficulty?.toLowerCase()] || "#6b7280";
    };

    // Colors for pie chart
    const pieColors = [
        "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#14b8a6",
        "#f97316", "#84cc16", "#22d3ee", "#eab308", "#3b82f6",
        "#22c55e", "#0ea5e9", "#fb923c", "#34d399", "#2dd4bf",
        "#facc15", "#38bdf8", "#4ade80", "#f43f5e", "#16a34a",
        "#0284c7", "#65a30d", "#ea580c", "#0891b2", "#059669"
    ];

    // Get total problems completed from progress
    const getTotalCompleted = () => {
        if (!profile?.progress) return 0;
        return profile.progress.easyCompleted + profile.progress.mediumCompleted + profile.progress.hardCompleted;
    };

    // Get topics with counts > 0, sorted by count
    const getActiveTopics = () => {
        if (!profile?.progress?.topicCounts) return [];
        return Object.entries(profile.progress.topicCounts)
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1]);
    };

    // Calculate total topic completions for pie chart
    const getTotalTopicCompletions = () => {
        return getActiveTopics().reduce((sum, [_, count]) => sum + count, 0);
    };

    // Generate pie chart segments
    const getPieChartSegments = () => {
        const topics = getActiveTopics();
        const total = getTotalTopicCompletions();
        if (total === 0) return [];

        let currentAngle = 0;
        return topics.map(([topic, count], index) => {
            const percentage = (count / total) * 100;
            const angle = (count / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            return {
                topic,
                count,
                percentage,
                startAngle,
                endAngle: currentAngle,
                color: pieColors[index % pieColors.length]
            };
        });
    };

    // SVG arc path generator
    const describeArc = (x, y, radius, startAngle, endAngle) => {
        if (endAngle - startAngle >= 360) {
            // Full circle
            return `M ${x - radius} ${y} A ${radius} ${radius} 0 1 1 ${x + radius} ${y} A ${radius} ${radius} 0 1 1 ${x - radius} ${y}`;
        }
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            "M", x, y,
            "L", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
            "Z"
        ].join(" ");
    };

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    if (loading) {
        return (
            <Flex minH="100vh" bg="#0b1220" align="center" justify="center" fontFamily="'JetBrains Mono', monospace">
                <Stack align="center" spacing={4}>
                    <Spinner size="xl" color="cyan.300" thickness="4px" />
                    <Text color="gray.300">Loading your dashboard...</Text>
                </Stack>
            </Flex>
        );
    }

    return (
        <Box
            minH="100vh"
            bg="#0b1220"
            backgroundImage="radial-gradient(circle at 15% 20%, rgba(56, 189, 248, 0.1), transparent 30%)"
            py={{ base: 6, md: 10 }}
            px={{ base: 3, md: 6 }}
            fontFamily="'JetBrains Mono', monospace"
        >
            <Container maxW="7xl">
                <Stack spacing={8}>
                    <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
                        <Stack spacing={1}>
                            <Heading color="white" size="lg">
                                Welcome back, <Text as="span" color="cyan.300">{profile?.username}</Text>
                            </Heading>
                            <Text color="gray.300">Ready to sharpen your coding skills today?</Text>
                        </Stack>
                        <HStack spacing={3}>
                            <Button onClick={() => navigate("/question")} bg="cyan.600" color="white" _hover={{ bg: "cyan.500" }}>
                                Start Practice
                            </Button>
                            {profile?.isAdmin && (
                                <Button onClick={() => navigate("/admin")} variant="outline" borderColor="whiteAlpha.400" color="gray.200" _hover={{ bg: "whiteAlpha.100" }}>
                                    Admin Panel
                                </Button>
                            )}
                        </HStack>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Box bg="rgba(15, 23, 42, 0.9)" borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="xl" p={5}>
                            <Text color="green.300" fontSize="sm">Problems Solved</Text>
                            <Heading color="white" size="lg" mt={1}>{getTotalCompleted()}</Heading>
                        </Box>
                        <Box bg="rgba(15, 23, 42, 0.9)" borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="xl" p={5}>
                            <Text color="orange.300" fontSize="sm">Success Rate</Text>
                            <Heading color="white" size="lg" mt={1}>{profile?.successRate || 0}%</Heading>
                        </Box>
                        <Box bg="rgba(15, 23, 42, 0.9)" borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="xl" p={5}>
                            <Text color="gray.300" fontSize="sm">Current Level</Text>
                            <Heading mt={1} size="lg" color={getDifficultyColor(profile?.currentDifficulty)} textTransform="capitalize">
                                {profile?.currentDifficulty || "easy"}
                            </Heading>
                        </Box>
                    </SimpleGrid>

                    {profile?.progress && (
                        <Box bg="rgba(15, 23, 42, 0.9)" borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="xl" p={{ base: 4, md: 6 }}>
                            <Heading size="md" color="white" mb={4}>Difficulty Breakdown</Heading>
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                <Box>
                                    <HStack justify="space-between" mb={2}>
                                        <Text color="green.300">Easy</Text>
                                        <Badge colorScheme="green">{profile.progress.easyCompleted}</Badge>
                                    </HStack>
                                    <Progress
                                        value={getTotalCompleted() > 0 ? (profile.progress.easyCompleted / getTotalCompleted()) * 100 : 0}
                                        colorScheme="green"
                                        bg="whiteAlpha.200"
                                        borderRadius="md"
                                    />
                                </Box>
                                <Box>
                                    <HStack justify="space-between" mb={2}>
                                        <Text color="orange.300">Medium</Text>
                                        <Badge colorScheme="orange">{profile.progress.mediumCompleted}</Badge>
                                    </HStack>
                                    <Progress
                                        value={getTotalCompleted() > 0 ? (profile.progress.mediumCompleted / getTotalCompleted()) * 100 : 0}
                                        colorScheme="orange"
                                        bg="whiteAlpha.200"
                                        borderRadius="md"
                                    />
                                </Box>
                                <Box>
                                    <HStack justify="space-between" mb={2}>
                                        <Text color="red.300">Hard</Text>
                                        <Badge colorScheme="red">{profile.progress.hardCompleted}</Badge>
                                    </HStack>
                                    <Progress
                                        value={getTotalCompleted() > 0 ? (profile.progress.hardCompleted / getTotalCompleted()) * 100 : 0}
                                        colorScheme="red"
                                        bg="whiteAlpha.200"
                                        borderRadius="md"
                                    />
                                </Box>
                            </SimpleGrid>
                        </Box>
                    )}

                    {profile?.progress && (
                        <Box bg="rgba(15, 23, 42, 0.9)" borderWidth="1px" borderColor="whiteAlpha.200" borderRadius="xl" p={{ base: 4, md: 6 }}>
                            <Heading size="md" color="white" mb={4}>Topics Mastered</Heading>
                            {getActiveTopics().length > 0 ? (
                                <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} gap={6}>
                                    <Flex justify="center" align="center">
                                        <svg viewBox="0 0 200 200" width="240" height="240">
                                            {getPieChartSegments().map((segment) => (
                                                <path
                                                    key={segment.topic}
                                                    d={describeArc(100, 100, 85, segment.startAngle, segment.endAngle)}
                                                    fill={segment.color}
                                                    style={{
                                                        opacity: hoveredSegment && hoveredSegment !== segment.topic ? 0.5 : 1,
                                                        transition: "opacity 0.2s ease"
                                                    }}
                                                    onMouseEnter={() => setHoveredSegment(segment.topic)}
                                                    onMouseLeave={() => setHoveredSegment(null)}
                                                >
                                                    <title>{segment.topic}: {segment.count} ({segment.percentage.toFixed(1)}%)</title>
                                                </path>
                                            ))}
                                            <circle cx="100" cy="100" r="55" fill="#0b1220" />
                                            <text x="100" y="95" textAnchor="middle" fill="#e2e8f0" fontSize="28" fontWeight="700">
                                                {getTotalTopicCompletions()}
                                            </text>
                                            <text x="100" y="114" textAnchor="middle" fill="#94a3b8" fontSize="12">
                                                Total
                                            </text>
                                        </svg>
                                    </Flex>

                                    <Stack spacing={2} maxH="300px" overflowY="auto" pr={1}>
                                        {getPieChartSegments().map((segment) => (
                                            <HStack
                                                key={segment.topic}
                                                px={3}
                                                py={2}
                                                borderRadius="md"
                                                bg={hoveredSegment === segment.topic ? "whiteAlpha.200" : "transparent"}
                                                borderWidth="1px"
                                                borderColor="whiteAlpha.200"
                                                onMouseEnter={() => setHoveredSegment(segment.topic)}
                                                onMouseLeave={() => setHoveredSegment(null)}
                                            >
                                                <Box w="12px" h="12px" borderRadius="3px" bg={segment.color} />
                                                <Text flex="1" color="gray.200" fontSize="sm">{segment.topic}</Text>
                                                <Text color="white" fontWeight="bold" fontSize="sm">{segment.count}</Text>
                                                <Text color="gray.400" fontSize="xs">{segment.percentage.toFixed(1)}%</Text>
                                            </HStack>
                                        ))}
                                    </Stack>
                                </Grid>
                            ) : (
                                <Stack align="center" py={8} color="gray.400">
                                    <Text fontSize="3xl">📊</Text>
                                    <Text>Complete problems to see your topic progress.</Text>
                                </Stack>
                            )}
                        </Box>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}

export default DashboardPage;

