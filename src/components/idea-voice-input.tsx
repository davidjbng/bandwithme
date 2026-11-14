import { ThemedText } from "./themed-text";

export type IdeaVoiceInputProps = {
  disabled: boolean;
  onTranscript: (text: string) => void;
  onRecordingChange: (recording: boolean) => void;
};

export default function IdeaVoiceInput(_props: IdeaVoiceInputProps) {
  return (
    <ThemedText type="small" themeColor="textSecondary">
      Spracheingabe ist in der iOS- und Android-App verfügbar, wenn ein lokales Sprachmodell
      vorhanden ist.
    </ThemedText>
  );
}
