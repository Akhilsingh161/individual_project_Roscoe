
/* ==========================================
   ROSCOE - AI VOICE COMPANION
   Wake word: Hello ROSCOE
========================================== */

(() => {
    "use strict";

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const state = {
        enabled: false,
        muted: false,
        awake: false,
        busy: false,
        speaking: false,
        recognition: null,
        restartTimer: null,
        sleepTimer: null,
        history: [],
        voices: []
    };

    const $ = id => document.getElementById(id);

    function setStatus(message, mode = "") {
        const status = $("voice-status");
        const text = $("voice-status-text");

        if (text) text.textContent = message;

        if (status) {
            status.className = "voice-status " + mode;
        }

        const avatar = $("roscoe-avatar");

        if (avatar) {
            avatar.classList.remove(
                "speaking",
                "thinking",
                "listening"
            );

            if (mode) avatar.classList.add(mode);
        }
    }

    function updateControls() {
        const toggle = $("voice-toggle");
        const toggleText = $("voice-toggle-text");
        const toggleIcon = $("voice-toggle-icon");

        if (toggle) {
            toggle.classList.toggle("active", state.enabled);
        }

        if (toggleText) {
            toggleText.textContent =
                state.enabled ? "Voice enabled" : "Enable voice";
        }

        if (toggleIcon) {
            toggleIcon.textContent =
                state.enabled ? "🎙" : "🔇";
        }

        const muteButton = $("voice-mute");

        if (muteButton) {
            muteButton.textContent =
                state.muted ? "🔇 Unmute" : "🔊 Mute";
        }
    }

    function showReply(message) {
        const box = $("bot-message");

        if (box) box.textContent = message;

        if (typeof window.roscoeSay === "function") {
            // The visible message has already been updated.
        }
    }

    function getSavedProfile() {
        try {
            const saved = JSON.parse(
                localStorage.getItem("roscoeAppData") || "{}"
            );

            return saved.profile || {};
        } catch {
            return {};
        }
    }

    function getVoices() {
        state.voices = window.speechSynthesis
            ? window.speechSynthesis.getVoices()
            : [];
    }

    if (window.speechSynthesis) {
        getVoices();
        window.speechSynthesis.onvoiceschanged = getVoices;
    }

    function speak(message) {
        return new Promise(resolve => {
            if (!window.speechSynthesis || state.muted) {
                resolve();
                return;
            }

            window.speechSynthesis.cancel();

            state.speaking = true;

            if (state.recognition) {
                try {
                    state.recognition.stop();
                } catch {}
            }

            const utterance =
                new SpeechSynthesisUtterance(message);

            const preferredVoice = state.voices.find(voice =>
                /female|zira|samantha|aria|jenny|sara|neerja/i
                    .test(voice.name)
            );

            if (preferredVoice) {
                utterance.voice = preferredVoice;
            } else {
                const englishVoice = state.voices.find(voice =>
                    /en-IN|en-US|en-GB/i.test(voice.lang)
                );

                if (englishVoice) {
                    utterance.voice = englishVoice;
                }
            }

            utterance.lang = "en-IN";
            utterance.rate = 1;
            utterance.pitch = 1.05;
            utterance.volume = 1;

            setStatus("ROSCOE is speaking...", "speaking");

            utterance.onend = () => {
                state.speaking = false;
                resolve();

                if (state.enabled) {
                    setStatus(
                        state.awake
                            ? "I'm listening to you..."
                            : 'Listening for "Hello ROSCOE"...',
                        "listening"
                    );

                    startRecognition();
                }
            };

            utterance.onerror = () => {
                state.speaking = false;
                resolve();

                if (state.enabled) startRecognition();
            };

            window.speechSynthesis.speak(utterance);
        });
    }

    function startRecognition() {
        if (!state.enabled ||
            !state.recognition ||
            state.speaking ||
            state.busy) {
            return;
        }

        clearTimeout(state.restartTimer);

        try {
            state.recognition.start();
        } catch (error) {
            // start() may throw if recognition is already running.
        }
    }

    function createRecognition() {
        if (!SpeechRecognition) {
            setStatus(
                "Speech recognition is not supported. Use Chrome or Edge.",
                "error"
            );

            return false;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-IN";
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            if (!state.busy && !state.speaking) {
                setStatus(
                    state.awake
                        ? "I'm listening to you..."
                        : 'Listening for "Hello ROSCOE"...',
                    "listening"
                );
            }
        };

        recognition.onresult = event => {
            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                if (!event.results[i].isFinal) continue;

                const transcript =
                    event.results[i][0].transcript.trim();

                if (transcript) {
                    handleSpeech(transcript);
                }
            }
        };

        recognition.onerror = event => {
            if (event.error === "not-allowed" ||
                event.error === "service-not-allowed") {

                state.enabled = false;
                updateControls();

                setStatus(
                    "Microphone permission denied. Allow microphone access.",
                    "error"
                );

                return;
            }

            if (event.error === "network") {
                setStatus(
                    "Speech recognition network error. Retrying...",
                    "error"
                );
            }
        };

        recognition.onend = () => {
            if (state.enabled && !state.speaking && !state.busy) {
                clearTimeout(state.restartTimer);

                state.restartTimer = setTimeout(
                    startRecognition,
                    700
                );
            }
        };

        state.recognition = recognition;

        return true;
    }

    function activateWakeWord(command = "") {
        state.awake = true;

        clearTimeout(state.sleepTimer);

        state.sleepTimer = setTimeout(() => {
            state.awake = false;

            if (state.enabled) {
                setStatus(
                    'Listening for "Hello ROSCOE"...',
                    "listening"
                );
            }
        }, 30000);

        speak("Hey Boss!");

        if (command.trim()) {
            setTimeout(() => processMessage(command), 1000);
        }
    }

    function handleSpeech(transcript) {
        const clean = transcript.trim();

        const wakePattern =
            /\bhello\s+roscoe\b/i;

        if (!state.awake) {
            const match = clean.match(wakePattern);

            if (!match) return;

            const command = clean
                .replace(wakePattern, "")
                .replace(/^[,.\s]+/, "")
                .trim();

            activateWakeWord(command);
            return;
        }

        clearTimeout(state.sleepTimer);

        state.sleepTimer = setTimeout(() => {
            state.awake = false;
            setStatus(
                'Listening for "Hello ROSCOE"...',
                "listening"
            );
        }, 30000);

        processMessage(clean);
    }

    async function processMessage(message) {
        if (!message || state.busy) return;

        state.busy = true;

        showReply("You: " + message);

        setStatus("ROSCOE is thinking...", "thinking");

        try {
            const profile = getSavedProfile();

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message,
                    profile,
                    history: state.history.slice(-12)
                })
            });

            if (!response.ok) {
                const error = await response.json()
                    .catch(() => ({}));

                throw new Error(
                    error.error || "AI server returned an error."
                );
            }

            const result = await response.json();

            const reply = result.reply;

            if (!reply) {
                throw new Error("ROSCOE received an empty response.");
            }

            state.history.push(
                { role: "user", text: message },
                { role: "assistant", text: reply }
            );

            state.history = state.history.slice(-24);

            try {
                const saved = JSON.parse(
                    localStorage.getItem("roscoeAppData") || "{}"
                );

                saved.chatHistory = [
                    ...(saved.chatHistory || []),
                    {
                        message,
                        reply,
                        timestamp: new Date().toISOString()
                    }
                ].slice(-50);

                localStorage.setItem(
                    "roscoeAppData",
                    JSON.stringify(saved)
                );
            } catch {}

            showReply(reply);

            state.busy = false;

            await speak(reply);

        } catch (error) {
            console.error("ROSCOE AI error:", error);

            const errorMessage =
                "I'm unable to connect to my AI brain right now. " +
                "Please check that the ROSCOE server is running.";

            showReply(errorMessage);

            state.busy = false;

            await speak(errorMessage);

        } finally {
            state.busy = false;

            if (state.enabled && !state.speaking) {
                startRecognition();
            }
        }
    }

    async function enableVoice() {
        if (!SpeechRecognition) {
            setStatus(
                "Use the latest Chrome or Edge browser.",
                "error"
            );

            return;
        }

        if (!window.isSecureContext) {
            setStatus(
                "Open ROSCOE using localhost or HTTPS.",
                "error"
            );

            return;
        }

        try {
            // Ask permission from a real button click.
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            stream.getTracks().forEach(track => track.stop());

            if (!state.recognition && !createRecognition()) {
                return;
            }

            state.enabled = true;
            state.awake = false;

            updateControls();

            setStatus(
                'Voice ready. Say "Hello ROSCOE".',
                "listening"
            );

            startRecognition();

        } catch (error) {
            console.error(error);

            setStatus(
                "Microphone access is required. Allow it in browser settings.",
                "error"
            );
        }
    }

    function disableVoice() {
        state.enabled = false;
        state.awake = false;
        state.busy = false;
        state.speaking = false;

        clearTimeout(state.restartTimer);
        clearTimeout(state.sleepTimer);

        if (state.recognition) {
            try {
                state.recognition.stop();
            } catch {}
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        setStatus("Voice assistant is turned off.");

        updateControls();
    }

    function toggleMute() {
        state.muted = !state.muted;

        if (state.muted && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            state.speaking = false;
        }

        updateControls();
    }

    function attachChat() {
        const form = $("roscoe-chat-form");
        const input = $("roscoe-chat-input");

        if (!form || !input) return;

        // Capture the submit before the old demo handler.
        form.addEventListener("submit", event => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const message = input.value.trim();

            if (!message) return;

            input.value = "";
            processMessage(message);

        }, true);
    }

    function attachControls() {
        const toggle = $("voice-toggle");
        const mute = $("voice-mute");

        if (toggle) {
            toggle.addEventListener("click", () => {
                if (state.enabled) {
                    disableVoice();
                } else {
                    enableVoice();
                }
            });
        }

        if (mute) {
            mute.addEventListener("click", toggleMute);
        }

        attachChat();
        updateControls();
    }

    // Keep the existing dashboard quick actions,
    // but let the AI generate their responses.
    window.roscoeReply = function(type) {
        const prompts = {
            motivation: "Motivate me with practical advice.",
            challenge: "Give me a new personalized daily challenge.",
            career: "Analyze my career goals and guide me."
        };

        processMessage(
            prompts[type] || "How can you help me today?"
        );
    };

    window.roscoeVoice = {
        enable: enableVoice,
        disable: disableVoice,
        speak,
        processMessage,
        getStatus: () => ({
            enabled: state.enabled,
            awake: state.awake,
            speaking: state.speaking
        })
    };

    document.addEventListener("DOMContentLoaded", attachControls);

})();
