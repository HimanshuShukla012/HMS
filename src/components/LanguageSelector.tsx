// LanguageSelector.tsx
import React, { useEffect, useRef } from "react";
import { Globe } from "lucide-react";
import "./LanguageSelector.css";

const LanguageSelector = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      console.log("LanguageSelector already initialized, skipping");
      return;
    }
    isInitialized.current = true;

    console.log("Initializing LanguageSelector");

    const waitForCombo = (callback: () => void, maxAttempts = 20, interval = 1000) => {
      let attempts = 0;
      const check = () => {
        const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
        if (combo) {
          console.log("Found .goog-te-combo:", combo);
          callback();
        } else if (attempts < maxAttempts) {
          attempts++;
          console.log(`Attempt ${attempts}: .goog-te-combo not found`);
          setTimeout(check, interval);
        } else {
          console.error("Google Translate combo box not found after max attempts");
          const container = document.getElementById("google_translate_element_dashboard");
          console.log("Current DOM content:", container?.innerHTML);
          // Fallback: Force select rendering by replacing simple layout
          const simpleElement = document.querySelector(".goog-te-gadget-simple");
          if (simpleElement) {
            console.log("Falling back to force select rendering");
            simpleElement.remove();
            new (window as any).google.translate.TranslateElement(
              {
                pageLanguage: "en",
                includedLanguages: "en,hi",
                layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
                multilanguagePage: false,
              },
              "google_translate_element_dashboard"
            );
          }
        }
      };
      check();
    };

    (window as any).googleTranslateElementInit = () => {
      console.log("Initializing Google Translate widget");
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: false,
        },
        "google_translate_element_dashboard"
      );

      waitForCombo(() => {
        const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
        if (combo) {
          const savedLang = localStorage.getItem("selectedLanguage");
          if (savedLang && combo.value !== savedLang) {
            console.log(`Restoring saved language: ${savedLang}`);
            combo.value = savedLang;
            if (combo.value === savedLang) {
              const changeEvent = new Event("change", { bubbles: true });
              Object.defineProperty(changeEvent, "target", { value: combo, writable: false });
              combo.dispatchEvent(changeEvent);
            }
          }
          document.addEventListener(
            "change",
            (event) => {
              const target = event.target as HTMLSelectElement;
              if (target.classList.contains("goog-te-combo")) {
                console.log(`Language changed to: ${target.value}`);
                try {
                  localStorage.setItem("selectedLanguage", target.value);
                } catch (e) {
                  console.warn("localStorage is not available:", e);
                }
              }
            },
            { once: true }
          );
        }
      });
    };

    if (!document.querySelector("#google-translate-script")) {
      console.log("Injecting Google Translate script");
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => console.error("Failed to load Google Translate script");
      document.body.appendChild(script);
    } else if ((window as any).google?.translate) {
      console.log("Google Translate script already loaded, reinitializing");
      (window as any).googleTranslateElementInit();
    }

    return () => {
      console.log("Cleaning up LanguageSelector");
      const script = document.querySelector("#google-translate-script");
      if (script) script.remove();
      const container = document.getElementById("google_translate_element_dashboard");
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Globe size={16} className="text-gray-600" />
      <div
        id="google_translate_element_dashboard"
        class="language-selector-dashboard"
      ></div>
    </div>
  );
};

export default LanguageSelector;