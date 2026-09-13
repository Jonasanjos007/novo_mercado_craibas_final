import { Check } from "lucide-react";

type RegistrationStep =
    | "Started"
    | "PersonalDataCompleted"
    | "EmailCompleted"
    | "EmailVerificationPending"
    | "PasswordCompleted"
    | "EmailVerificationPending"
    | "Completed";

interface RegistrationProgressProps {
    step: RegistrationStep;
}

const steps = [
    { key: "Started", label: "Dados pessoais" },
    { key: "EmailCompleted", label: "E-mail" },
    { key: "PasswordCompleted", label: "Senha" },
    { key: "Completed", label: "Finalização" },
];

export default function RegistrationProgress({
    step,
}: RegistrationProgressProps) {

    /*
     * Converte os estados internos do cadastro
     * para uma posição visual.
     */
    const getCurrentIndex = () => {
        switch (step) {
            case "Started":
                return 0;
            case "PersonalDataCompleted":
                return 1;
            case "EmailCompleted":
                return 2;
            case "EmailVerificationPending":
                return 1;
            case "PasswordCompleted":
                return 3;
            case "Completed":
                return 4;
            default:
                return 0;
        }
    };

    const currentIndex = getCurrentIndex();
    const isDone = currentIndex >= steps.length;

    const progress =
        currentIndex === 0
            ? 0
            : Math.min(
                100,
                Math.round((currentIndex / (steps.length - 1)) * 100)
            );

    return (
        <div className="w-full mb-10">

            {/* Cabeçalho */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <p className="text-[13px] text-gray-400 mb-1">
                        Passo {Math.min(currentIndex + 1, steps.length)} de {steps.length}
                    </p>
                    <p className="font-display text-lg font-semibold text-gray-900 tracking-tight">
                        {isDone
                            ? "Cadastro concluído"
                            : steps[Math.min(currentIndex, steps.length - 1)].label}
                    </p>
                </div>

                <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
                        <circle
                            cx="20" cy="20" r="17"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                        />
                        <circle
                            cx="20" cy="20" r="17"
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 17}
                            strokeDashoffset={2 * Math.PI * 17 * (1 - progress / 100)}
                            className="transition-all duration-700 ease-out"
                        />
                    </svg>
                    <span className="text-[11px] font-semibold text-gray-700">
                        {progress}%
                    </span>
                </div>
            </div>

            {/* Steps */}
            <div className="relative flex items-start justify-between">

                {/* Linha de fundo */}
                <div className="absolute top-4 left-4 right-4 h-px bg-gray-200" />

                {/* Linha de progresso */}
                <div
                    className="absolute top-4 left-4 h-px bg-gradient-to-r from-amber-400 to-orange-600 transition-all duration-700 ease-out"
                    style={{
                        width: `calc(${progress}% * (100% - 2rem) / 100)`,
                    }}
                />

                {steps.map((item, index) => {
                    const completed = index < currentIndex;
                    const active = index === currentIndex && !isDone;

                    return (
                        <div
                            key={item.key}
                            className="relative z-10 flex flex-col items-center gap-2.5"
                        >
                            <div
                                className={`
                                    flex items-center justify-center w-8 h-8 rounded-full
                                    transition-all duration-500
                                    ${completed
                                        ? "bg-gradient-to-b from-amber-400 to-orange-600 text-white shadow-[0_4px_10px_rgba(234,88,12,0.35)]"
                                        : active
                                            ? "bg-[#09090b] text-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.15)]"
                                            : "bg-[#09090b]/80 text-white/30"
                                    }
                                `}
                            >
                                {completed ? (
                                    <Check className="w-4 h-4" strokeWidth={2.5} />
                                ) : (
                                    <span
                                        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-orange-500" : "bg-white/30"
                                            }`}
                                    />
                                )}
                            </div>

                            <span
                                className={`
                                    text-[11px] sm:text-xs text-center whitespace-nowrap
                                    transition-colors duration-300
                                    ${active || completed ? "text-gray-700" : "text-gray-300"}
                                `}
                            >
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
