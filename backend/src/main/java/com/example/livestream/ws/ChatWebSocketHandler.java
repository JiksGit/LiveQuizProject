package com.example.livestream.ws;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> activeSessions = Collections.synchronizedSet(new HashSet<>());
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        activeSessions.add(session);
        broadcastSystemMessage("A user joined. Viewers: " + activeSessions.size());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            JsonNode payload = objectMapper.readTree(message.getPayload());
            String type = payload.has("type") ? payload.get("type").asText() : "message";

            if ("message".equals(type)) {
                String username = payload.has("username") ? payload.get("username").asText() : "anonymous";
                String text = payload.has("message") ? payload.get("message").asText() : "";
                JsonNode response = objectMapper.createObjectNode()
                        .put("type", "message")
                        .put("id", UUID.randomUUID().toString())
                        .put("username", username)
                        .put("message", text)
                        .put("timestamp", Instant.now().toString());
                broadcastText(response.toString());
            } else if ("follow".equals(type)) {
                String username = payload.has("username") ? payload.get("username").asText() : "anonymous";
                JsonNode response = objectMapper.createObjectNode()
                        .put("type", "follow")
                        .put("username", username)
                        .put("timestamp", Instant.now().toString());
                broadcastText(response.toString());
            }
        } catch (IOException e) {
            session.sendMessage(new TextMessage("{\"type\":\"error\",\"message\":\"Invalid JSON\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        activeSessions.remove(session);
        broadcastSystemMessage("A user left. Viewers: " + activeSessions.size());
    }

    private void broadcastSystemMessage(String text) throws IOException {
        JsonNode system = objectMapper.createObjectNode()
                .put("type", "system")
                .put("id", UUID.randomUUID().toString())
                .put("username", "system")
                .put("message", text)
                .put("timestamp", Instant.now().toString());
        broadcastText(system.toString());
    }

    private void broadcastText(String text) throws IOException {
        synchronized (activeSessions) {
            for (WebSocketSession s : activeSessions) {
                if (s.isOpen()) {
                    s.sendMessage(new TextMessage(text));
                }
            }
        }
    }
}

