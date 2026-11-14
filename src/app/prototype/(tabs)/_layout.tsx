import { NativeTabs } from "expo-router/native-tabs";
import { useDemo } from "@/components/design-demo";

export default function DemoTabs() {
  const { colors } = useDemo();
  return (
    <NativeTabs
      tintColor={colors.tint}
      backgroundColor={colors.background}
      labelStyle={{ color: colors.secondary }}
    >
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Übersicht</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="termine">
        <NativeTabs.Trigger.Label>Termine</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="event" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="songs">
        <NativeTabs.Trigger.Label>Songs</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="music.note.list" md="queue_music" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="band">
        <NativeTabs.Trigger.Label>Band</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2" md="group" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
