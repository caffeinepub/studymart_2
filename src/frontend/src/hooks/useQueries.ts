import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ShoppingItem, StudyNote, UserProfile } from "../backend";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetStudyNotes() {
  const { actor, isFetching } = useActor();
  return useQuery<StudyNote[]>({
    queryKey: ["studyNotes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableStudyNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStudyNote(noteId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<StudyNote | null>({
    queryKey: ["studyNote", noteId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStudyNote(noteId);
    },
    enabled: !!actor && !isFetching && !!noteId,
  });
}

export function useGetSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPurchasedNotes() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<StudyNote[]>({
    queryKey: ["purchasedNotes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPurchasedStudyNotes();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetUserCredits() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<bigint>({
    queryKey: ["userCredits"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUserCredits();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principal: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal } = await import("@dfinity/principal");
      return actor.getUserProfile(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useBuyStudyNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.buyStudyNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchasedNotes"] });
      queryClient.invalidateQueries({ queryKey: ["userCredits"] });
      queryClient.invalidateQueries({ queryKey: ["studyNotes"] });
    },
  });
}

export type CreateNoteInput = {
  title: string;
  description: string;
  subject: string;
  price: bigint;
  content: ExternalBlob;
};

export function useCreateNoteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createNoteListing(
        input.title,
        input.description,
        input.subject,
        input.price,
        input.content,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyNotes"] });
    },
  });
}

export function useAddCredits() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credits: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addCredits(credits);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCredits"] });
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error("Actor not available");
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) throw new Error("Stripe session missing url");
      return session;
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isStripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}
