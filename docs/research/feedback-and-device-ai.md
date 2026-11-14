# Private feedback and on-device AI

Reviewed 2026-11-14. Context: [Private idea capture and on-device speech](https://github.com/davidjbng/bandwithme/issues/31).

## User decisions

- Save ideas privately in Convex first. Publishing any text to this public GitHub repository needs a later explicit approval; automatic issue creation is deliberately disabled.
- Audio and recognition stay on the device. If unavailable, keep the text field; no cloud fallback.
- Agent implementation starts only when the user triggers it. `review-app-ideas` supports this review; no autonomous worker acts on submissions.

## Implemented route

Authenticated members use the profile's large native text field or German voice input, review/edit the transcript, and send explicitly. Only confirmed text is uploaded. Convex derives authorship from a current Auth 2 session, validates 10–4,000 trimmed characters, and deduplicates retries by author and request ID. The official [Convex Rate Limiter](https://github.com/convex/rate-limiter) applies a per-author token bucket: capacity five, replenishing five per hour (one every 12 minutes). Retries of an already saved idea do not consume quota; rejected submissions report the remaining wait. Only the author can query their last 20 entries through the public API. Authorized operators can review via the Convex dashboard/CLI.

The existing [Expo UI SDK 58 Button](https://docs.expo.dev/versions/v58.0.0/sdk/ui/) supplies platform actions; Keyboard Controller keeps forms reachable. Text fields use React Native because its focus observers do not reliably track Compose/SwiftUI fields. See the dependency report for the compatibility boundary. Recognition uses [`expo-speech-recognition`](https://github.com/jamsch/expo-speech-recognition), an existing Expo module, so a new custom module is unnecessary. Web offers text only. Native code is optional at runtime so an old development build degrades to text.

The recognizer requires on-device recognition, disables persisted recordings and checks installed German Android assets. The iOS upstream implementation conditionally applied its offline flag only when the recognizer supported the requested locale. The pinned pnpm patch adds a native per-locale guard before microphone setup and always applies the required flag; unsupported locales fail instead of falling back to network. Keep the regression test and patch until upstream provides equivalent behavior. See [the upstream native implementation](https://github.com/jamsch/expo-speech-recognition/blob/main/ios/ExpoSpeechRecognizer.swift) and [Apple's on-device request contract](https://developer.apple.com/documentation/speech/sfspeechrecognitionrequest/requiresondevicerecognition).

A generation counter cancels stale permission checks. Stop waits for the recognizer's final result; backgrounding aborts capture. Capture stops after 60 seconds, with a bounded final-result wait. Real device, offline, language-asset and accessibility checks remain necessary before shipping; JS tests do not prove speech recognition quality or native binary behavior.

## Useful next AI capabilities

| Opportunity                                  | Apple                                                            | Android                                        | Product gate                                        |
| -------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- |
| Polish a rough idea or propose a short title | Foundation Models through `@react-native-ai/apple`               | ML Kit rewriting/proofreading or Prompt API    | Explicit preview and accept; retain original text   |
| Summarize several band notes                 | On-device text generation on eligible Apple Intelligence devices | Gemini Nano via AICore on supported devices    | Membership checks, no automatic publication         |
| Improved speech recognition                  | Provider transcription via Apple Speech frameworks               | ML Kit GenAI Speech Recognition basic/advanced | Check device/model/language support before enabling |

[`@react-native-ai/apple`](https://ai-sdk.dev/providers/community-providers/react-native-apple) supports AI SDK-style access to Apple's local text and speech facilities, with different OS requirements for different features. Foundation Models text generation requires an eligible device with Apple Intelligence enabled; transcription is a separate capability. It is not added as an unused dependency in this step because capture works without it and no generated-text behavior was requested yet.

[Google's ML Kit GenAI](https://developers.google.com/ml-kit/genai) offers local summarization, rewriting and proofreading through AICore. Its [speech API](https://developers.google.com/ml-kit/genai/speech-recognition/android) currently distinguishes basic on-device recognition and advanced models with narrower hardware support. A universal availability assumption would be incorrect. If an approved feature needs an API absent from maintained packages, implement a small local module using the versioned Expo Modules API and capability checks; keep text entry fully functional without it.

## Verification

Vitest covers author isolation, unauthenticated and revoked sessions, length limits, retry deduplication, rate limits, speech permissions/cancellation/final results, and the installed iOS patch. Web smoke tests cover the native-control web fallback and safe auth landing routes. Native iOS Simulator and Android Debug compilation also pass; actual device/offline recognition validation remains a separate outstanding gate. See [the integration report](modernization-validation.md).
