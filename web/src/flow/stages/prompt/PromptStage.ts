import "#elements/Divider";
import "#elements/forms/FormElement";
import "#flow/components/ak-flow-card";

import { LOCALES } from "#elements/ak-locale-context/definitions";
import { CapabilitiesEnum, WithCapabilitiesConfig } from "#elements/mixins/capabilities";

import { BaseStage } from "#flow/stages/base";

import {
    PromptChallenge,
    PromptChallengeResponseRequest,
    PromptTypeEnum,
    StagePrompt,
} from "@goauthentik/api";

import { msg } from "@lit/localize";
import { css, CSSResult, html, nothing, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import PFAlert from "@patternfly/patternfly/components/Alert/alert.css";
import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFCheck from "@patternfly/patternfly/components/Check/check.css";
import PFForm from "@patternfly/patternfly/components/Form/form.css";
import PFFormControl from "@patternfly/patternfly/components/FormControl/form-control.css";
import PFInputGroup from "@patternfly/patternfly/components/InputGroup/input-group.css";
import PFLogin from "@patternfly/patternfly/components/Login/login.css";
import PFTitle from "@patternfly/patternfly/components/Title/title.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

/**
 * Ícone de olho vetorial (sem preenchimento, mesmo estilo usado no resto da
 * marca) pro botão de mostrar/ocultar senha dos campos de tipo "password"
 * de uma PromptStage (cadastro, definir nova senha na recuperação) — esse
 * tipo de campo não tem toggle nativo no Authentik (diferente do campo de
 * senha da tela de login, que usa ak-flow-input-password).
 */
const EYE_OPEN_ICON = html`<svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
>
    <path
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
    />
    <circle cx="12" cy="12" r="3" />
</svg>`;

const EYE_CLOSED_ICON = html`<svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
>
    <path
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
    />
</svg>`;

function togglePasswordVisibility(ev: PointerEvent): void {
    ev.preventDefault();
    const button = ev.currentTarget as HTMLButtonElement;
    const input = button.previousElementSibling as HTMLInputElement | null;
    if (!input) return;
    const masked = input.type === "password";
    input.type = masked ? "text" : "password";
    button.classList.toggle("ak-password-toggle--visible", masked);
    button.setAttribute("aria-label", masked ? msg("Hide password") : msg("Show password"));
}

@customElement("ak-stage-prompt")
export class PromptStage extends WithCapabilitiesConfig(
    BaseStage<PromptChallenge, PromptChallengeResponseRequest>,
) {
    static styles: CSSResult[] = [
        PFBase,
        PFLogin,
        PFAlert,
        PFForm,
        PFFormControl,
        PFInputGroup,
        PFTitle,
        PFButton,
        PFCheck,
        css`
            textarea {
                min-height: 4em;
                max-height: 15em;
                resize: vertical;
            }
        `,
    ];

    renderPromptInner(prompt: StagePrompt): TemplateResult {
        switch (prompt.type) {
            case PromptTypeEnum.Text:
                return html`<input
                    type="text"
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    autocomplete="off"
                    class="pf-c-form-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.TextArea:
                return html`<textarea
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    autocomplete="off"
                    class="pf-c-form-control"
                    ?required=${prompt.required}
                >
${prompt.initialValue}</textarea
                >`;
            case PromptTypeEnum.TextReadOnly:
                return html`<input
                    type="text"
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="pf-c-form-control"
                    readonly
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.TextAreaReadOnly:
                return html`<textarea
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="pf-c-form-control"
                    readonly
                >
${prompt.initialValue}</textarea
                >`;
            case PromptTypeEnum.Username:
                return html`<input
                    type="text"
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    autocomplete="username"
                    spellcheck="false"
                    class="pf-c-form-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.Email:
                return html`<input
                    type="email"
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="pf-c-form-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.Password:
                return html`<div class="pf-c-input-group">
                    <input
                        type="password"
                        name="${prompt.fieldKey}"
                        placeholder="${prompt.placeholder}"
                        autocomplete="new-password"
                        class="pf-c-form-control pf-m-icon"
                        ?required=${prompt.required}
                    />
                    <button
                        type="button"
                        class="pf-c-button pf-m-control ak-password-toggle"
                        aria-label=${msg("Show password")}
                        @click=${togglePasswordVisibility}
                    >
                        <span class="ak-password-toggle__icon ak-password-toggle__icon--show" aria-hidden="true"
                            >${EYE_OPEN_ICON}</span
                        >
                        <span class="ak-password-toggle__icon ak-password-toggle__icon--hide" aria-hidden="true"
                            >${EYE_CLOSED_ICON}</span
                        >
                    </button>
                </div>`;
            case PromptTypeEnum.Number:
                return html`<input
                    type="number"
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="pf-c-form-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.Date:
                return html`<input
                    type="date"
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="pf-c-form-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.DateTime:
                return html`<input
                    type="datetime"
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="pf-c-form-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.File:
                return html`<input
                    type="file"
                    name="${prompt.fieldKey}"
                    placeholder="${prompt.placeholder}"
                    class="pf-c-form-control"
                    ?required=${prompt.required}
                    value="${prompt.initialValue}"
                />`;
            case PromptTypeEnum.Separator:
                return html`<ak-divider>${prompt.placeholder}</ak-divider>`;
            case PromptTypeEnum.Hidden:
                return html`<input
                    type="hidden"
                    name="${prompt.fieldKey}"
                    value="${prompt.initialValue}"
                    class="pf-c-form-control"
                    ?required=${prompt.required}
                />`;
            case PromptTypeEnum.Static:
                return html`<p>${unsafeHTML(prompt.initialValue)}</p>`;
            case PromptTypeEnum.Dropdown:
                return html`<select class="pf-c-form-control" name="${prompt.fieldKey}">
                    ${prompt.choices?.map((choice) => {
                        return html`<option
                            value="${choice}"
                            ?selected=${prompt.initialValue === choice}
                        >
                            ${choice}
                        </option>`;
                    })}
                </select>`;
            case PromptTypeEnum.RadioButtonGroup:
                return html`${(prompt.choices || []).map((choice) => {
                    const id = `${prompt.fieldKey}-${choice}`;
                    return html`<div class="pf-c-check">
                        <input
                            type="radio"
                            class="pf-c-check__input"
                            name="${prompt.fieldKey}"
                            id="${id}"
                            ?checked="${prompt.initialValue === choice}"
                            ?required="${prompt.required}"
                            value="${choice}"
                        />
                        <label class="pf-c-check__label" for=${id}>${choice}</label>
                    </div> `;
                })}`;
            case PromptTypeEnum.AkLocale: {
                const locales = this.can(CapabilitiesEnum.CanDebug)
                    ? LOCALES
                    : LOCALES.filter((locale) => locale.code !== "debug");
                const options = locales.map(
                    (locale) =>
                        html`<option
                            value=${locale.code}
                            ?selected=${locale.code === prompt.initialValue}
                        >
                            ${locale.code.toUpperCase()} - ${locale.label()}
                        </option> `,
                );

                return html`<select class="pf-c-form-control" name="${prompt.fieldKey}">
                    <option value="" ?selected=${prompt.initialValue === ""}>
                        ${msg("Auto-detect (based on your browser)")}
                    </option>
                    ${options}
                </select>`;
            }
            default:
                return html`<p>invalid type '${prompt.type}'</p>`;
        }
    }

    renderPromptHelpText(prompt: StagePrompt) {
        if (prompt.subText === "") {
            return nothing;
        }
        return html`<p class="pf-c-form__helper-text">${unsafeHTML(prompt.subText)}</p>`;
    }

    shouldRenderInWrapper(prompt: StagePrompt): boolean {
        // Special types that aren't rendered in a wrapper
        return !(
            prompt.type === PromptTypeEnum.Static ||
            prompt.type === PromptTypeEnum.Hidden ||
            prompt.type === PromptTypeEnum.Separator
        );
    }

    renderField(prompt: StagePrompt): TemplateResult {
        // Checkbox is rendered differently
        if (prompt.type === PromptTypeEnum.Checkbox) {
            return html`<div class="pf-c-check">
                <input
                    type="checkbox"
                    class="pf-c-check__input"
                    id="${prompt.fieldKey}"
                    name="${prompt.fieldKey}"
                    ?checked=${prompt.initialValue !== ""}
                    ?required=${prompt.required}
                />
                <label class="pf-c-check__label" for="${prompt.fieldKey}">${prompt.label}</label>
                ${prompt.required
                    ? html`<p class="pf-c-form__helper-text">${msg("Required.")}</p>`
                    : nothing}
                <p class="pf-c-form__helper-text">${unsafeHTML(prompt.subText)}</p>
            </div>`;
        }
        if (this.shouldRenderInWrapper(prompt)) {
            return html`<ak-form-element
                label="${prompt.label}"
                ?required="${prompt.required}"
                class="pf-c-form__group"
                .errors=${(this.challenge?.responseErrors || {})[prompt.fieldKey]}
            >
                ${this.renderPromptInner(prompt)} ${this.renderPromptHelpText(prompt)}
            </ak-form-element>`;
        }
        return html` ${this.renderPromptInner(prompt)} ${this.renderPromptHelpText(prompt)}`;
    }

    renderContinue(): TemplateResult {
        return html` <div class="pf-c-form__group pf-m-action">
            <button type="submit" class="pf-c-button pf-m-primary pf-m-block">
                ${msg("Continue")}
            </button>
        </div>`;
    }

    render(): TemplateResult {
        return html`<ak-flow-card .challenge=${this.challenge}>
            <form class="pf-c-form" @submit=${this.submitForm}>
                ${this.challenge.fields.map((prompt) => {
                    return this.renderField(prompt);
                })}
                ${this.renderNonFieldErrors()} ${this.renderContinue()}
            </form>
        </ak-flow-card>`;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "ak-stage-prompt": PromptStage;
    }
}
