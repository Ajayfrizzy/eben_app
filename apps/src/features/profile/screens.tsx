import { useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth";
import { Button, Card, Field, State } from "../../components/ui";
import { styles } from "../../theme";
import { useAppStore } from "../../store";
import { requireIdentity } from "../auth/client";
import { message } from "../auth/screens";
import { requireBackend } from "../../services/supabase";
import {
  createProfileRepository,
  type ProfileInput,
  type StudentProfile,
  type Reference,
} from "./repository";
import { useProfileReferences, useSaveProfile, useStudentProfile } from "./hooks";

function useLogout() {
  const cache = useQueryClient();
  const { demo } = useAuth();
  return async () => {
    if (!demo) await requireIdentity().logout();
    cache.clear();
    router.replace("/welcome");
  };
}
export function ProfileEditor() {
  const { demo, session } = useAuth();
  const profile = useStudentProfile();
  const references = useProfileReferences();
  if (!demo && (profile.isPending || references.isPending)) return <State loading />;
  if (!demo && (profile.isError || references.isError))
    return (
      <State
        error="Unable to load your profile. Check your connection."
        retry={() => {
          void profile.refetch();
          void references.refetch();
        }}
      />
    );
  if (
    !demo &&
    (!references.data?.institutions.length || !references.data?.interests.length)
  )
    return (
      <State
        empty="Institution and interest options are not available yet. Please contact Eben Institute support."
        retry={() => {
          void references.refetch();
        }}
      />
    );
  return (
    <ProfileForm
      key={session?.user.id ?? "demo"}
      profile={profile.data ?? null}
      references={
        references.data ?? {
          institutions: [{ id: "demo", name: "Demo institution" }],
          interests: [{ id: "demo", name: "Demo interest" }],
        }
      }
    />
  );
}
function ProfileForm({
  profile,
  references,
}: {
  profile: StudentProfile | null;
  references: { institutions: Reference[]; interests: Reference[] };
}) {
  const { demo } = useAuth();
  const save = useSaveProfile();
  const logout = useLogout();
  const offline = useAppStore((s) => s.offline);
  const [input, setInput] = useState<ProfileInput>({
    fullName: profile?.full_name ?? "",
    country: profile?.country ?? "",
    city: profile?.city ?? "",
    institution: profile?.institution_id ?? "",
    programme: profile?.programme ?? "",
    studyLevel: profile?.study_level ?? "",
    biography: profile?.biography ?? "",
    interests: profile?.user_interests.map((i) => i.interest_id) ?? [],
    skills: [],
    visibility: profile?.visibility?.directory ?? "private",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const field = (
    key: "fullName" | "country" | "city" | "programme" | "studyLevel" | "biography",
    label: string,
  ) => (
    <Field
      accessibilityLabel={label}
      placeholder={label}
      value={input[key]}
      onChangeText={(value) => setInput((old) => ({ ...old, [key]: value }))}
    />
  );
  const submit = async (complete: boolean) => {
    setError("");
    setNotice("");
    try {
      if (demo) {
        setNotice("Demo only: no profile was saved.");
        if (complete) router.replace("/profile");
        return;
      }
      await save.mutateAsync({ input, complete });
      if (complete) router.replace("/profile");
      else setNotice("Draft saved. You can resume on this account after restarting.");
    } catch (cause) {
      setError(message(cause));
    }
  };
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>
        {profile?.onboarding_complete ? "Edit your profile" : "Tell us about you"}
      </Text>
      {offline && (
        <Text style={styles.muted}>
          Offline. Changes remain in this form until you reconnect and save.
        </Text>
      )}
      {field("fullName", "Full name")}
      {field("country", "Country")}
      {field("city", "State or city")}
      <Text style={styles.heading}>Institution</Text>
      {references.institutions.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="radio"
          accessibilityState={{ checked: input.institution === item.id }}
          onPress={() => setInput((old) => ({ ...old, institution: item.id }))}
        >
          <Text style={styles.body}>
            {input.institution === item.id ? "◉" : "○"} {item.name}
            {item.country ? ` · ${item.country}` : ""}
          </Text>
        </Pressable>
      ))}
      {field("programme", "Programme / department")}
      {field("studyLevel", "Study level")}
      {field("biography", "Biography (optional)")}
      <Text style={styles.heading}>Interests</Text>
      {references.interests.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: input.interests.includes(item.id) }}
          onPress={() =>
            setInput((old) => ({
              ...old,
              interests: old.interests.includes(item.id)
                ? old.interests.filter((id) => id !== item.id)
                : [...old.interests, item.id],
            }))
          }
        >
          <Text style={styles.body}>
            {input.interests.includes(item.id) ? "☑" : "☐"} {item.name}
          </Text>
        </Pressable>
      ))}
      <View style={styles.row}>
        <Switch
          accessibilityLabel="Share name and biography with verified students"
          value={input.visibility === "students"}
          onValueChange={(value) =>
            setInput((old) => ({ ...old, visibility: value ? "students" : "private" }))
          }
        />
        <Text style={styles.body}>
          Share my name and biography with verified students
        </Text>
      </View>
      <Text style={styles.muted}>
        Location, institution, interests and account details remain private.
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.body}>
          {error}
        </Text>
      )}
      {!!notice && <Text style={styles.body}>{notice}</Text>}
      <Button
        label={
          save.isPending
            ? "Saving…"
            : profile?.onboarding_complete
              ? "Save profile"
              : "Complete profile"
        }
        disabled={save.isPending || (!demo && offline)}
        onPress={() => {
          void submit(true);
        }}
      />
      {!profile?.onboarding_complete && (
        <Button
          label="Save draft"
          disabled={save.isPending || (!demo && offline)}
          onPress={() => {
            void submit(false);
          }}
        />
      )}
      <Button
        label="Sign out"
        onPress={() => {
          void logout().catch((cause) => setError(message(cause)));
        }}
      />
    </ScrollView>
  );
}
export function StudentProfileScreen() {
  const { demo, session } = useAuth();
  const profile = useStudentProfile();
  const refs = useProfileReferences();
  const logout = useLogout();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const offline = useAppStore((s) => s.offline);
  if (!demo && profile.isPending) return <State loading />;
  if (!demo && profile.isError)
    return (
      <State
        error="Unable to load your profile."
        retry={() => {
          void profile.refetch();
        }}
      />
    );
  const p = profile.data;
  const act = async (operation: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your profile</Text>
      {offline && (
        <Text style={styles.muted}>Offline · showing your last loaded profile</Text>
      )}
      <Card>
        <Text style={styles.heading}>
          {demo ? "Demo student" : p?.full_name || "Profile not completed"}
        </Text>
        <Text style={styles.body}>
          {demo ? "Development demo — no live profile" : session?.user.email}
        </Text>
        {p && (
          <>
            <Text style={styles.body}>
              {p.country} · {p.city}
            </Text>
            <Text style={styles.body}>
              {refs.data?.institutions.find((i) => i.id === p.institution_id)?.name ??
                "Institution unavailable"}
            </Text>
            <Text style={styles.body}>
              {p.programme} · {p.study_level}
            </Text>
            <Text style={styles.body}>{p.biography || "No biography added"}</Text>
            <Text style={styles.body}>
              {p.user_interests
                .map(
                  (i) =>
                    refs.data?.interests.find((r) => r.id === i.interest_id)?.name ??
                    "Interest unavailable",
                )
                .join(", ")}
            </Text>
            <Text style={styles.muted}>
              Name and biography:{" "}
              {p.visibility?.directory === "students"
                ? "visible to verified students"
                : "private"}
            </Text>
          </>
        )}
        {refs.isError && (
          <State
            error="Unable to load institution and interest names."
            retry={() => {
              void refs.refetch();
            }}
          />
        )}
        <Button label="Edit profile" onPress={() => router.push("/edit-profile")} />
      </Card>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.body}>
          {error}
        </Text>
      )}
      <Button
        label={busy ? "Please wait…" : "Sign out"}
        disabled={busy}
        onPress={() => {
          void act(logout);
        }}
      />
      <Button
        label="Request account deletion"
        disabled={busy || offline || demo}
        onPress={() =>
          Alert.alert(
            "Request account deletion",
            "Send a deletion request for your account?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Request deletion",
                style: "destructive",
                onPress: () => {
                  void act(async () => {
                    await createProfileRepository(requireBackend()).requestDeletion();
                    Alert.alert(
                      "Request received",
                      "Your deletion request has been recorded.",
                    );
                  });
                },
              },
            ],
          )
        }
      />
    </ScrollView>
  );
}
