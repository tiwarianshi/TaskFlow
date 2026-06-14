import { useCallback, useEffect, useRef, useState } from "react";
import {
  changePassword as changePasswordRequest,
  getPreferences,
  getProfile,
  updatePreferences,
  updateProfile,
} from "../api/settingsApi";
import useAuth from "./useAuth";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

const DEFAULT_ERRORS = {
  profile: null,
  preferences: null,
  saveProfile: null,
  savePreferences: null,
  changePassword: null,
};

export function useSettings(initialPreferences = null) {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(user || null);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [errors, setErrors] = useState(DEFAULT_ERRORS);
  const requestIdRef = useRef(0);
  const profileRef = useRef(user || null);
  const preferencesRef = useRef(initialPreferences);

  const clearError = useCallback((key) => {
    setErrors((current) => ({
      ...current,
      [key]: null,
    }));
  }, []);

  const refreshSettings = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setErrors(DEFAULT_ERRORS);

    const [profileResult, preferencesResult] = await Promise.allSettled([
      getProfile(),
      getPreferences(),
    ]);

    if (requestIdRef.current !== requestId) {
      return {
        profile: null,
        preferences: null,
      };
    }

    const nextErrors = { ...DEFAULT_ERRORS };
    let nextProfile = profileRef.current;
    let nextPreferences = preferencesRef.current;

    if (profileResult.status === "fulfilled") {
      nextProfile = profileResult.value;
      profileRef.current = nextProfile;
      setProfile(nextProfile);
      updateUser(nextProfile);
    } else {
      nextErrors.profile = getErrorMessage(
        profileResult.reason,
        "Failed to load profile.",
      );
      if (user) {
        nextProfile = user;
        profileRef.current = user;
        setProfile(user);
      }
    }

    if (preferencesResult.status === "fulfilled") {
      nextPreferences = preferencesResult.value;
      preferencesRef.current = nextPreferences;
      setPreferences(nextPreferences);
    } else {
      nextErrors.preferences = getErrorMessage(
        preferencesResult.reason,
        "Failed to load preferences.",
      );
    }

    setErrors(nextErrors);
    setLoading(false);

    return {
      profile: nextProfile,
      preferences: nextPreferences,
    };
  }, [updateUser, user]);

  const saveProfile = useCallback(
    async (profileData) => {
      setSavingProfile(true);
      clearError("saveProfile");

      try {
        const updatedProfile = await updateProfile(profileData);
        profileRef.current = updatedProfile;
        setProfile(updatedProfile);
        updateUser(updatedProfile);
        return updatedProfile;
      } catch (error) {
        const message = getErrorMessage(error, "Failed to save profile.");
        setErrors((current) => ({
          ...current,
          saveProfile: message,
        }));
        throw error;
      } finally {
        setSavingProfile(false);
      }
    },
    [clearError, updateUser],
  );

  const savePreferences = useCallback(
    async (preferencesData) => {
      setSavingPreferences(true);
      clearError("savePreferences");

      try {
        const updatedPreferences = await updatePreferences(preferencesData);
        preferencesRef.current = updatedPreferences;
        setPreferences(updatedPreferences);
        return updatedPreferences;
      } catch (error) {
        const message = getErrorMessage(error, "Failed to save preferences.");
        setErrors((current) => ({
          ...current,
          savePreferences: message,
        }));
        throw error;
      } finally {
        setSavingPreferences(false);
      }
    },
    [clearError],
  );

  const changePassword = useCallback(
    async (passwordData) => {
      setChangingPassword(true);
      clearError("changePassword");

      try {
        return await changePasswordRequest(passwordData);
      } catch (error) {
        const message = getErrorMessage(error, "Failed to change password.");
        setErrors((current) => ({
          ...current,
          changePassword: message,
        }));
        throw error;
      } finally {
        setChangingPassword(false);
      }
    },
    [clearError],
  );

  useEffect(() => {
    refreshSettings();

    return () => {
      requestIdRef.current += 1;
    };
  }, [refreshSettings]);

  useEffect(() => {
    if (user) {
      profileRef.current = user;
      setProfile(user);
    }
  }, [user]);

  return {
    loading,
    savingProfile,
    savingPreferences,
    changingPassword,
    errors,
    profile,
    preferences,
    setProfile,
    setPreferences,
    saveProfile,
    savePreferences,
    changePassword,
    refreshSettings,
  };
}

export default useSettings;
