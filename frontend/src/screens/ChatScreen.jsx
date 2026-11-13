import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";

export default function ChatScreen() {
    const user = useAuthStore((state) => state.user);
    const { theme, isDark } = useTheme();

    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState([
        { id: "1", text: "Hey! Do you have the notes for Unit 2?", sender: "Rahul", isMe: false },
        { id: "2", text: "Yes, I uploaded them in the Notes section!", sender: "Me", isMe: true },
        { id: "3", text: "Awesome! Thanks a lot.", sender: "Rahul", isMe: false },
    ]);

    const handleSendMessage = () => {
        if (!messageText.trim()) return;

        const newMsg = {
            id: String(Date.now()),
            text: messageText,
            sender: "Me",
            isMe: true,
        };

        setMessages((prev) => [...prev, newMsg]);
        setMessageText("");
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={[styles.header, { backgroundColor: theme.bgCard, borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Study Group Chat 💬</Text>
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.bubble,
                            item.isMe
                                ? [styles.myBubble, { backgroundColor: theme.primary }]
                                : [styles.otherBubble, { backgroundColor: theme.bgCard, borderColor: theme.border, borderWidth: 1 }],
                        ]}
                    >
                        <Text style={[styles.senderText, { color: item.isMe ? (isDark ? "#0c0f10" : "#ffffff") : theme.textMuted }]}>
                            {item.sender}
                        </Text>
                        <Text
                            style={[
                                styles.messageText,
                                { color: item.isMe ? (isDark ? "#0c0f10" : "#ffffff") : theme.textPrimary, fontWeight: item.isMe ? "600" : "400" },
                            ]}
                        >
                            {item.text}
                        </Text>
                    </View>
                )}
            />

            <View style={[styles.inputRow, { backgroundColor: theme.bgCard, borderTopColor: theme.border, borderTopWidth: 1 }]}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: isDark ? "#14130e" : "#f5f3ef",
                            color: theme.textPrimary,
                            borderColor: theme.border,
                            borderWidth: 1,
                        },
                    ]}
                    placeholder="Type a message..."
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    value={messageText}
                    onChangeText={setMessageText}
                />
                <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.primary }]} onPress={handleSendMessage}>
                    <Text style={[styles.sendBtnText, { color: isDark ? "#0c0f10" : "#ffffff" }]}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    messageList: {
        padding: 16,
    },
    bubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 14,
        marginBottom: 10,
    },
    myBubble: {
        alignSelf: "flex-end",
    },
    otherBubble: {
        alignSelf: "flex-start",
    },
    senderText: {
        fontSize: 11,
        marginBottom: 2,
    },
    messageText: {
        fontSize: 14,
    },
    inputRow: {
        flexDirection: "row",
        padding: 12,
        alignItems: "center",
    },
    input: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        fontSize: 14,
    },
    sendBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    sendBtnText: {
        fontWeight: "bold",
        fontSize: 14,
    },
});
