"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ConsentStatus = "accepted" | "declined" | null;

type CookieConsentContextType = {
    consent: ConsentStatus;
    isLoaded: boolean;
    acceptCookies: () => void;
    declineCookies: () => void;
    hasConsented: () => boolean;
};

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

const CONSENT_KEY = "cookie_consent";

export function CookieConsentProvider({ children }: { children: ReactNode }) {
    const [consent, setConsent] = useState<ConsentStatus>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Read saved consent from localStorage on mount
        const saved = localStorage.getItem(CONSENT_KEY) as ConsentStatus;
        setConsent(saved);
        setIsLoaded(true);
    }, []);

    function acceptCookies() {
        localStorage.setItem(CONSENT_KEY, "accepted");
        setConsent("accepted");
    }

    function declineCookies() {
        localStorage.setItem(CONSENT_KEY, "declined");
        setConsent("declined");
    }

    // Quick helper used before every tracking call
    function hasConsented() {
        return consent === "accepted";
    }

    return (
        <CookieConsentContext.Provider
            value={{ consent, isLoaded, acceptCookies, declineCookies, hasConsented }}
        >
            {children}
        </CookieConsentContext.Provider>
    );
}

export function useCookieConsent() {
    const ctx = useContext(CookieConsentContext);
    if (!ctx) throw new Error("useCookieConsent must be used inside CookieConsentProvider");
    return ctx;
}