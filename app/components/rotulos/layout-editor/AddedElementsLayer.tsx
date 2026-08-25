"use client";

import { useEffect, useRef, useState } from "react";
import MovableGroup from "./MovableGroup";
import TextEffectsToolbar from "./TextEffectsToolbar";
import {
  INSERTABLE_ICON_OPTIONS,
  InsertedElementArtwork,
  TEXT_STYLE_OPTIONS,
  getInsertedElementLabel,
  localizeInsertableLabel,
  resolveTextFontFamily,
} from "./insertableCatalog";
import { useEditableSignCanvas } from "./canvasContext";
import {
  addedElementGroupId,
  type AddedCanvasElement,
  type AddedTextElement,
  type AddedTextStyle,
  type InsertableIconKey,
  type TextFontFamily,
} from "./types";

function AddedTextInspector({
  element,
  draft,
  onDraftChange,
}: {
  element: AddedTextElement;
  draft: string;
  onDraftChange: (value: string) => void;
}) {
  const { lang, updateAddedElement, announce } = useEditableSignCanvas();

  const saveText = () => {
    const text = draft.trim().slice(0, 120) || (lang === "es" ? "NUEVO TEXTO" : "NEW TEXT");
    onDraftChange(text);
    updateAddedElement({ ...element, text });
    announce(lang === "es" ? "Texto actualizado." : "Text updated.");
  };

  const updateStyle = (style: AddedTextStyle) => {
    updateAddedElement({ ...element, style });
    announce(lang === "es" ? "Estilo de texto actualizado." : "Text style updated.");
  };

  const bold = element.bold ?? true;
  const italic = element.italic === true;
  const underline = element.underline === true;
  const fontFamily = resolveTextFontFamily(element);

  const toggleBold = () => {
    updateAddedElement({ ...element, bold: !bold });
    announce(lang === "es" ? "Negrita actualizada." : "Bold updated.");
  };
  const toggleItalic = () => {
    updateAddedElement({ ...element, italic: !italic });
    announce(lang === "es" ? "Cursiva actualizada." : "Italic updated.");
  };
  const toggleUnderline = () => {
    updateAddedElement({ ...element, underline: !underline });
    announce(lang === "es" ? "Subrayado actualizado." : "Underline updated.");
  };
  const updateFontFamily = (value: TextFontFamily) => {
    updateAddedElement({ ...element, fontFamily: value });
    announce(lang === "es" ? "Tipografía actualizada." : "Typography updated.");
  };

  return (
    <div className="grid min-w-56 gap-2 sm:grid-cols-[minmax(150px,1fr)_auto]">
      <label className="grid gap-1 text-left text-[10px] font-black uppercase tracking-[0.12em] text-zinc-300">
        {lang === "es" ? "Contenido" : "Content"}
        <input
          type="text"
          value={draft}
          maxLength={120}
          onChange={(event) => onDraftChange(event.target.value)}
          onBlur={saveText}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="min-h-10 rounded-lg border border-white/25 bg-zinc-950 px-3 text-sm font-bold normal-case tracking-normal text-white outline-none focus:border-[#00C4B0]"
        />
      </label>
      <label className="grid gap-1 text-left text-[10px] font-black uppercase tracking-[0.12em] text-zinc-300">
        {lang === "es" ? "Estilo" : "Style"}
        <select
          value={element.style}
          onChange={(event) => updateStyle(event.target.value as AddedTextStyle)}
          className="min-h-10 rounded-lg border border-white/25 bg-zinc-950 px-2 text-sm font-bold normal-case tracking-normal text-white outline-none focus:border-[#00C4B0]"
        >
          {TEXT_STYLE_OPTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {localizeInsertableLabel(option.label, lang)}
            </option>
          ))}
        </select>
      </label>

      <TextEffectsToolbar
        lang={lang}
        bold={bold}
        italic={italic}
        underline={underline}
        fontFamily={fontFamily}
        onToggleBold={toggleBold}
        onToggleItalic={toggleItalic}
        onToggleUnderline={toggleUnderline}
        onFontFamilyChange={updateFontFamily}
      />
    </div>
  );
}

function AddedIconInspector({ element }: { element: Extract<AddedCanvasElement, { kind: "icon" }> }) {
  const { lang, updateAddedElement, announce } = useEditableSignCanvas();

  return (
    <label className="grid min-w-52 gap-1 text-left text-[10px] font-black uppercase tracking-[0.12em] text-zinc-300">
      {lang === "es" ? "Cambiar ícono" : "Change icon"}
      <select
        value={element.icon}
        onChange={(event) => {
          updateAddedElement({ ...element, icon: event.target.value as InsertableIconKey });
          announce(lang === "es" ? "Ícono actualizado." : "Icon updated.");
        }}
        className="min-h-10 rounded-lg border border-white/25 bg-zinc-950 px-3 text-sm font-bold normal-case tracking-normal text-white outline-none focus:border-[#00C4B0]"
      >
        {INSERTABLE_ICON_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {localizeInsertableLabel(option.label, lang)}
          </option>
        ))}
      </select>
    </label>
  );
}

function AddedElementObject({ element }: { element: AddedCanvasElement }) {
  const {
    lang,
    canvasRef,
    selectGroup,
    commitLayout,
    updateAddedElement,
    removeAddedElement,
    duplicateAddedElement,
    announce,
  } = useEditableSignCanvas();
  const groupId = addedElementGroupId(element.id);
  const label = getInsertedElementLabel(element);
  const [draftText, setDraftText] = useState(element.kind === "text" ? element.text : "");
  const elementText = element.kind === "text" ? element.text : "";
  const currentElementRef = useRef(element);
  const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  currentElementRef.current = element;

  useEffect(() => {
    setDraftText(elementText);
  }, [elementText]);

  useEffect(
    () => () => {
      if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
    },
    [],
  );

  const updateDraftText = (value: string) => {
    setDraftText(value);
    if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
    draftSaveTimerRef.current = setTimeout(() => {
      draftSaveTimerRef.current = null;
      const currentElement = currentElementRef.current;
      if (currentElement.kind === "text") {
        updateAddedElement({ ...currentElement, text: value.slice(0, 120) });
      }
    }, 180);
  };

  const remove = () => {
    removeAddedElement(element.id);
    selectGroup(null);
    canvasRef.current?.parentElement
      ?.querySelector<HTMLElement>("[data-layout-canvas-tools] button")
      ?.focus({ preventScroll: true });
    announce(lang === "es" ? "Objeto agregado eliminado." : "Added object deleted.");
  };

  const duplicate = () => {
    const duplicateId = duplicateAddedElement(element.id);
    if (!duplicateId) {
      announce(lang === "es" ? "No se pudo duplicar el objeto." : "The object could not be duplicated.");
      return;
    }

    selectGroup(addedElementGroupId(duplicateId));
    announce(lang === "es" ? "Objeto duplicado." : "Object duplicated.");
  };

  return (
    <MovableGroup
      groupId={groupId}
      label={label}
      readOnlyRole={element.kind === "icon" ? "img" : undefined}
      readOnlyLabel={element.kind === "icon" ? label : undefined}
      className="pointer-events-auto absolute left-0 top-0 z-30 w-fit max-w-[82%]"
      onDelete={remove}
      onDuplicate={duplicate}
      onReset={() => {
        commitLayout(groupId, { anchor: { x: 0.5, y: 0.5 }, scale: 1 });
        announce(lang === "es" ? "Objeto centrado y restablecido." : "Object centered and reset.");
      }}
      inspector={
        element.kind === "text" ? (
          <AddedTextInspector
            element={{ ...element, text: draftText }}
            draft={draftText}
            onDraftChange={updateDraftText}
          />
        ) : (
          <AddedIconInspector element={element} />
        )
      }
    >
      <InsertedElementArtwork element={element} textOverride={draftText} />
    </MovableGroup>
  );
}

export default function AddedElementsLayer() {
  const { addedElements, lang } = useEditableSignCanvas();

  return (
    <div
      data-layout-added-layer
      role="group"
      className="pointer-events-none absolute inset-0 z-20"
      aria-label={lang === "es" ? "Objetos agregados" : "Added objects"}
    >
      {addedElements.map((element) => (
        <AddedElementObject key={element.id} element={element} />
      ))}
    </div>
  );
}
