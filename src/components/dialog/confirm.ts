import Swal from "sweetalert2";

type ConfirmOptions = {
    title?: string;
    text?: string;
    html?: string;

    confirmText?: string;
    cancelText?: string;

    icon?: "warning" | "question" | "info" | "success" | "error";

    // If true, the confirm button uses your brand accent style
    accentConfirm?: boolean;

    // If true, user must type a keyword (ex: DELETE) to confirm
    requireText?: {
        placeholder?: string;
        match: string; // e.g. "DELETE"
        label?: string;
    };
};

function buildSwalBase() {
    // Global default styling for your light admin theme
    return Swal.mixin({
        buttonsStyling: true,
        reverseButtons: true,
        focusCancel: true,
        backdrop: true,
        // Keep it minimal and professional
        customClass: {
            popup: "swal-popup",
            title: "swal-title",
            htmlContainer: "swal-text",
            confirmButton: "swal-btn swal-btn-confirm",
            cancelButton: "swal-btn swal-btn-cancel",
            input: "swal-input",
        },
    });
}

const SwalBase = buildSwalBase();

/**
 * Generic confirm dialog (use for any action)
 */
export async function confirmAction(options: ConfirmOptions = {}) {
    const {
        title = "Are you sure?",
        text,
        html,
        confirmText = "Confirm",
        cancelText = "Cancel",
        icon = "question",
        accentConfirm = true,
        requireText,
    } = options;

    const result = await SwalBase.fire({
        title,
        text,
        html,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,

        // Optional: require typing a keyword
        ...(requireText
            ? {
                input: "text" as const,
                inputLabel: requireText.label ?? `Type "${requireText.match}" to confirm`,
                inputPlaceholder: requireText.placeholder ?? requireText.match,
                preConfirm: (value) => {
                    const v = String(value ?? "").trim();
                    if (v !== requireText.match) {
                        Swal.showValidationMessage(`Please type "${requireText.match}" to confirm.`);
                        return null;
                    }
                    return true;
                },
            }
            : {}),

        // Apply accent style on confirm (CSS handles)
        didOpen: () => {
            if (!accentConfirm) {
                const btn = Swal.getConfirmButton();
                btn?.classList.add("swal-btn-neutral");
            }
        },
    });

    return result.isConfirmed;
}

/**
 * Delete-specific confirm dialog (common case)
 */
export async function confirmDelete(entityName = "this item") {
    return confirmAction({
        title: "Delete confirmation",
        text: `This will permanently delete ${entityName}. This action cannot be undone.`,
        icon: "warning",
        confirmText: "Delete",
        cancelText: "Cancel",
        accentConfirm: true,
    });
}

/**
 * Optional helpers (SweetAlert2 toast mode)
 * Use if you want consistent alerts without building your own toast.
 */
const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    customClass: {
        popup: "swal-toast",
    },
});

export function toastSuccess(message: string) {
    return Toast.fire({ icon: "success", title: message });
}

export function toastError(message: string) {
    return Toast.fire({ icon: "error", title: message });
}
