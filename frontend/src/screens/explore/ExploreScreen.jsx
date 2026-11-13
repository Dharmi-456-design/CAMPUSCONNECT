import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function ExploreScreen({ onNavigateTab }) {
    const { theme, isDark } = useTheme();
    const [searchTerm, setSearchTerm] = useState("");

    const modules = [
        { id: "1", title: "📚 Study Notes & PDFs", desc: "Access verified lecture notes & PYQs", tab: "notes" },
        { id: "2", title: "❓ Doubts & Q&A Hub", desc: "Ask questions and get answers", tab: "doubts" },
        { id: "3", title: "🚀 Hackathon Teams", desc: "Find teammates for projects & hackathons", tab: "team" },
        { id: "4", title: "🛍️ Campus Marketplace", desc: "Buy & sell books, calculators, and lab gear", tab: "marketplace" },
        { id: "5", title: "💬 Student Chat", desc: "Real-time chat with peers and groups", tab: "chat" },
        { id: "6", title: "📸 Camera & Scanner", desc: "Scan notes with live camera preview", tab: "camera" },
    ];

    const filteredModules = modules.filter(
        (m) =>
            m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Campus Hub & Utilities 🧭</Text>
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>Explore all campus portals and modules</Text>

            <TextInput
                style={[styles.searchInput, { backgroundColor: theme.bgCard, color: theme.textPrimary, borderColor: theme.border, borderWidth: 1 }]}
                placeholder="Search modules..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={searchTerm}
                onChangeText={setSearchTerm}
            />

            <View style={styles.grid}>
                {filteredModules.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border, borderWidth: 1 }]}
                        onPress={() => onNavigateTab && onNavigateTab(item.tab)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                        <Text style={[styles.cardDesc, { color: theme.textMuted }]}>{item.desc}</Text>
                        <TouchableOpacity
                            style={[styles.openBtn, { backgroundColor: theme.primary }]}
                            onPress={() => onNavigateTab && onNavigateTab(item.tab)}
                        >
                            <Text style={[styles.openBtnText, { color: isDark ? "#0c0f10" : "#ffffff" }]}>Open</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
    },
    headerSub: {
        fontSize: 14,
        marginTop: 4,
        marginBottom: 16,
    },
    searchInput: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 16,
        fontSize: 14,
    },
    grid: {
        flexDirection: "column",
    },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    cardDesc: {
        fontSize: 13,
        marginVertical: 6,
    },
    openBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: "flex-start",
        marginTop: 6,
    },
    openBtnText: {
        fontSize: 13,
        fontWeight: "bold",
    },
});
