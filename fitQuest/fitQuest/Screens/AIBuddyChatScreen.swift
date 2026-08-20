//
//  AIBuddyChatScreen.swift
//  fitQuest
//
//  Ported from screens/AIBuddyChatScreen.js — resends the full message
//  history on every turn (matches the server contract, which has no
//  session state), and shows errors as an AI-styled chat bubble rather
//  than a toast/banner.
//

import SwiftUI

private struct ChatMessage: Identifiable {
    let id: String
    let sender: String // "user" | "ai"
    let text: String
}

private let fallbackReply = "Hmm, I couldn't reach my brain just now — mind trying that again?"

struct AIBuddyChatScreen: View {
    @EnvironmentObject private var router: Router

    @State private var messages: [ChatMessage] = [
        ChatMessage(id: "seed-1", sender: "ai", text: "Hey! Ready to crush today's leg quest? I've set up a routine that'll boost your STR stat!"),
    ]
    @State private var draft = ""
    @State private var isSending = false

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollViewReader { scrollProxy in
                ScrollView {
                    LazyVStack(spacing: Tokens.Spacing.sm) {
                        ForEach(messages) { message in
                            bubble(message)
                                .id(message.id)
                        }
                        if isSending {
                            bubble(ChatMessage(id: "typing", sender: "ai", text: "Typing…"))
                                .id("typing")
                        }
                    }
                    .padding(Tokens.Spacing.md)
                }
                .onChange(of: messages.count) { _, _ in scrollToBottom(scrollProxy) }
                .onChange(of: isSending) { _, _ in scrollToBottom(scrollProxy) }
            }

            inputBar
        }
        .background(Tokens.Colors.background)
        .navigationBarBackButtonHidden(true)
    }

    private var header: some View {
        HStack {
            Button { router.pop() } label: {
                Image(systemName: "chevron.left")
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(Tokens.Colors.surfaceContainerLowest))
                    .overlay(Circle().stroke(Tokens.Colors.ink, lineWidth: 2))
            }
            .buttonStyle(.plain)
            Spacer()
            Text("AI Buddy").font(.headline).textCase(.uppercase)
            Spacer()
            Image(systemName: "gearshape.fill").opacity(0.4).frame(width: 40, height: 40)
        }
        .padding(Tokens.Spacing.md)
    }

    private func bubble(_ message: ChatMessage) -> some View {
        HStack(alignment: .bottom, spacing: Tokens.Spacing.xs) {
            if message.sender != "user" {
                ZStack {
                    Circle().fill(Tokens.Colors.primaryContainer)
                    Image(systemName: "message.fill").foregroundStyle(Color(hex: 0x005442))
                }
                .frame(width: 40, height: 40)
            } else {
                Spacer(minLength: 40)
            }

            Text(message.text)
                .foregroundStyle(message.sender == "user" ? Tokens.Colors.onPrimary : Tokens.Colors.onSurface)
                .padding(Tokens.Spacing.sm)
                .background(message.sender == "user" ? Tokens.Colors.primary : Tokens.Colors.surfaceContainerLowest)
                .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.lg))
                .frame(maxWidth: 280, alignment: message.sender == "user" ? .trailing : .leading)

            if message.sender != "user" {
                Spacer(minLength: 40)
            }
        }
        .frame(maxWidth: .infinity, alignment: message.sender == "user" ? .trailing : .leading)
    }

    private var inputBar: some View {
        HStack(spacing: Tokens.Spacing.sm) {
            TextField("Type a message...", text: $draft)
                .padding(Tokens.Spacing.sm)
                .background(Tokens.Colors.surfaceContainerLowest)
                .clipShape(RoundedRectangle(cornerRadius: Tokens.Radius.full))
                .overlay(RoundedRectangle(cornerRadius: Tokens.Radius.full).stroke(Tokens.Colors.ink, lineWidth: 2))
                .disabled(isSending)
                .onSubmit { Task { await send() } }

            Button {
                Task { await send() }
            } label: {
                Image(systemName: "arrow.up")
                    .foregroundStyle(Color(hex: 0x6D0010))
                    .frame(width: 44, height: 44)
                    .background(Circle().fill(Tokens.Colors.secondaryContainer))
            }
            .buttonStyle(.plain)
            .opacity(isSending || draft.trimmingCharacters(in: .whitespaces).isEmpty ? 0.5 : 1)
            .disabled(isSending || draft.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding(Tokens.Spacing.md)
        .overlay(Rectangle().fill(Tokens.Colors.ink).frame(height: 3), alignment: .top)
    }

    private func scrollToBottom(_ proxy: ScrollViewProxy) {
        withAnimation {
            proxy.scrollTo(isSending ? "typing" : messages.last?.id, anchor: .bottom)
        }
    }

    private func send() async {
        let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, !isSending else { return }
        draft = ""
        let history = messages.map { AIBuddyTurn(sender: $0.sender, text: $0.text) }
        messages.append(ChatMessage(id: UUID().uuidString, sender: "user", text: text))

        isSending = true
        do {
            let reply = try await APIClient.shared.sendBuddyMessage(text, history: history)
            messages.append(ChatMessage(id: UUID().uuidString, sender: "ai", text: reply.reply))
        } catch {
            let message = error.localizedDescription.isEmpty ? fallbackReply : error.localizedDescription
            messages.append(ChatMessage(id: UUID().uuidString, sender: "ai", text: message))
        }
        isSending = false
    }
}

#Preview {
    NavigationStack {
        AIBuddyChatScreen()
            .environmentObject(Router())
    }
}
