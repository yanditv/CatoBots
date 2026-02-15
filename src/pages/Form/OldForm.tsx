import { useState, useEffect } from "react";
import { Building, Upload, Save, Loader2, User, Users, Bot, Phone, Mail, FileText } from "lucide-react";
import Rules from "./Regulations/rules";
import { useAuth } from "../../context/AuthContext";
import { useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function Form() {
    const [email, setEmail] = useState("");
    const [institution, setInstitution] = useState("");
    const [category, setCategory] = useState("");
    const [step, setStep] = useState(1);
    const [juniorCategory, setJuniorCategory] = useState("");
    const [seniorCategory, setSeniorCategory] = useState("");
    const [masterCategory, setMasterCategory] = useState("");

    // Robofut / Generic Fields (Step 3)
    const [robotName, setRobotName] = useState("");
    const [members, setMembers] = useState("");
    const [advisorName, setAdvisorName] = useState("");
    const [advisorPhone, setAdvisorPhone] = useState("");

    // Scratch & Play specific
    const [teamName, setTeamName] = useState("");

    // Payment specific
    const [paymentProof, setPaymentProof] = useState<string | null>(null); // Stores filename
    const [isSaving, setIsSaving] = useState(false);

    // Terms specific
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Rules modal
    const [showRules, setShowRules] = useState(false);

    const { googleUser, loginGoogle } = useAuth();

    // Helper to process login success
    const processLogin = (userObj: any) => {
        loginGoogle(userObj);
        setEmail(userObj.email);
    };

    // 1. One Tap Login (Auto-detect)
    useGoogleOneTapLogin({
        onSuccess: (credentialResponse) => {
            if (credentialResponse.credential) {
                const decoded: any = jwtDecode(credentialResponse.credential);
                processLogin({
                    email: decoded.email,
                    name: decoded.name,
                    picture: decoded.picture,
                    sub: decoded.sub
                });
            }
        },
        onError: () => console.log('One Tap Login Failed'),
        auto_select: true
    });

    // 2. Standard Login / Switch Account
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfo: any = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                }).then(res => res.json());

                processLogin({
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    sub: userInfo.sub
                });
            } catch (error) {
                console.error("Failed to fetch user info", error);
            }
        },
        onError: () => console.log('Login Failed'),
        // @ts-ignore
        prompt: 'select_account',
    });

    // Load Draft
    useEffect(() => {
        if (googleUser?.email) {
            setEmail(googleUser.email); // Auto-fill
            const loadDraft = async () => {
                try {
                    const res = await fetch(`/api/registrations/draft?email=${googleUser.email}`);
                    const data = await res.json();
                    if (data.registration) {
                        const { step: savedStep, data: savedData, payment_proof_filename } = data.registration;
                        if (savedData) {
                            if (savedData.institution) setInstitution(savedData.institution);
                            if (savedData.category) setCategory(savedData.category);
                            if (savedData.juniorCategory) setJuniorCategory(savedData.juniorCategory);
                            if (savedData.seniorCategory) setSeniorCategory(savedData.seniorCategory);
                            if (savedData.masterCategory) setMasterCategory(savedData.masterCategory);
                            if (savedData.robotName) setRobotName(savedData.robotName);
                            if (savedData.members) setMembers(savedData.members);
                            if (savedData.advisorName) setAdvisorName(savedData.advisorName);
                            if (savedData.advisorPhone) setAdvisorPhone(savedData.advisorPhone);
                            if (savedData.teamName) setTeamName(savedData.teamName);
                            if (savedData.termsAccepted) setTermsAccepted(savedData.termsAccepted);
                        }
                        if (payment_proof_filename) setPaymentProof(payment_proof_filename);
                        if (savedStep) setStep(savedStep);
                    }
                } catch (error) {
                    console.error("Failed to load draft", error);
                }
            };
            loadDraft();
        }
    }, [googleUser]);

    // Save Draft
    const saveDraft = async (currentStep: number) => {
        if (!googleUser?.email) return;
        setIsSaving(true);
        const data = {
            institution, category, juniorCategory, seniorCategory, masterCategory,
            robotName, members, advisorName, advisorPhone, teamName, termsAccepted
        };
        try {
            await fetch('/api/registrations/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: googleUser.email,
                    step: currentStep,
                    data,
                    paymentProof // Include filename
                })
            });
        } catch (error) {
            console.error("Failed to save draft", error);
        } finally {
            setIsSaving(false);
        }
    };

    // We modify the "Cambiar cuenta" button to call handleGoogleLogin directly
    // This will open the popup to select account without logging out first visually.

    const handleNext = () => {
        if (step === 1) {
            // Basic validation
            if (!email || !institution || !category) {
                alert("Por favor completa los campos obligatorios");
                return;
            }
            if (!googleUser && !email) {
                // If no google user, require manual email input (already covered by !email check)
            }
            setStep(2);
            saveDraft(2);
            window.scrollTo(0, 0);
        } else if (step === 2) {
            if (category === 'Junior' && !juniorCategory) {
                alert("Por favor selecciona una categoría");
                return;
            }
            if (category === 'Senior' && !seniorCategory) {
                alert("Por favor selecciona una categoría");
                return;
            }
            if (category === 'Master' && !masterCategory) {
                alert("Por favor selecciona una categoría");
                return;
            }
            setStep(3);
            saveDraft(3);
            window.scrollTo(0, 0);
        } else if (step === 3) {
            setStep(4);
            saveDraft(4);
            window.scrollTo(0, 0);
        } else if (step === 4) {
            if (!paymentProof) {
                alert("Por favor sube el comprobante de pago");
                return;
            }
            setStep(5);
            saveDraft(5);
            window.scrollTo(0, 0);
        } else {
            // Handle final submit
            handleSubmit(null as any);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
        saveDraft(step - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!termsAccepted) {
            alert("Debes aceptar los términos y condiciones para continuar");
            return;
        }

        if (!paymentProof) {
            alert("Por favor sube el comprobante de pago");
            return;
        }

        try {
            await fetch('/api/registrations/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: googleUser?.email })
            });
            alert("Formulario enviado correctamente!");
            handleClear(); // Optional: Clear local state or redirect?
            // Maybe redirect to a "Success" page? For now just alert.
        } catch (error) {
            console.error("Submit failed", error);
            alert("Error al enviar el formulario.");
        }
    };

    const handleClear = () => {
        setEmail("");
        setInstitution("");
        setCategory("");
        setJuniorCategory("");
        setSeniorCategory("");
        setMasterCategory("");
        setRobotName("");
        setMembers("");
        setAdvisorName("");
        setAdvisorPhone("");
        setTeamName("");
        setPaymentProof(null);
        setTermsAccepted(false);
        setStep(1);
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen bg-[#f0ebf8] py-3 px-4 sm:px-0 font-sans text-sm">
            <div className="max-w-[640px] mx-auto space-y-3">

                {/* Header Image - Always visible or just on first page? Usually always visible in GForms but content changes. 
                    The prompt says "APARECER EL MISMO MODELO", implying the header/look stays. 
                */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="w-full h-auto">
                        <img
                            src="/header.png"
                            alt="CatoBots Header"
                            className="w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                </div>

                {/* GLOBAL TITLE CARD - Visible on top of steps? 
                    In GForms, the main title card usually stays on Page 1, and Page 2 has its own Section Title.
                    The user said: "CatoBots IV... alexis... JUNIOR...". 
                    So Step 2 should have its own title card "JUNIOR".
                */}

                {step === 1 && (
                    <>
                        {/* Event Details Card (Step 1) */}
                        <div className="bg-white rounded-lg border-t-[10px] border-l-0 border-r-0 border-b-0 border-t-[#03E2D9] shadow-sm relative overflow-hidden">
                            <div className="pt-6 px-6 pb-6">
                                <h1 className="text-[32px] font-normal text-black mb-4 leading-tight">CatoBots IV</h1>

                                <div className="space-y-4 text-[11pt] text-gray-900 border-b border-gray-200 pb-2">
                                    <p><span className="font-bold">FECHA DEL EVENTO:</span> 20 DE MARZO DEL 2026</p>
                                    <p><span className="font-bold">DIRECCIÓN DEL EVENTO:</span> COLISEO DE LAS AGUILAS ROJAS (TARQUI Y HUMBOLT)</p>
                                    <p><span className="font-bold">UBICACIÓN DE LA COMPETENCIA:</span> <a href="https://maps.app.goo.gl/dwUEErcrpNe4CiN59" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">https://maps.app.goo.gl/dwUEErcrpNe4CiN59</a></p>

                                    <p className="font-bold mt-4">INDICACIONES GENERALES:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>
                                            <span className="font-bold">Representación Institucional:</span> Cada Unidad Educativa podrá inscribir un
                                            <span className="font-bold"> máximo de 3 robots por categoría</span>. Estos cupos son exclusivos para la institución, independientemente de si los estudiantes pertenecen a la jornada matutina, vespertina o a un club independiente. La Unidad Educativa es la única entidad encargada de seleccionar a sus representantes oficiales.
                                        </li>
                                        <li>
                                            <span className="font-bold">Costo de Inscripción:</span> El valor de la inscripción es de <span className="font-bold">$10 por Institución Educativa.</span>
                                        </li>
                                        <li>
                                            Es fundamental <span className="font-bold">escribir correctamente los nombres de la Unidad Educativa</span>, Robots, Equipos e Integrantes.
                                        </li>
                                        <li>Se recomienda leer detenidamente el reglamento que será compartido.</li>
                                        <li>Los robots deberán ser homologados previamente a la competencia.</li>
                                        <li>Los equipos deben registrarse a través del formulario oficial del evento.</li>
                                    </ul>

                                    <p className="font-bold mt-4">ENLACE DE REGLAMENTOS:</p>
                                    <ul className="list-disc pl-5">
                                        <li></li>
                                    </ul>

                                    <p className="font-bold mt-4">TIPOS DE COMPETENCIAS:</p>
                                    <ol className="list-decimal pl-5 space-y-1">
                                        <li><span className="font-bold">Junior</span> (Nivel escolar/básico)</li>
                                        <li><span className="font-bold">Senior</span> (Nivel bachillerato/intermedio)</li>
                                        <li><span className="font-bold">Master</span> (Nueva categoria abierta para <span className="font-bold">Universidades y Clubes Independientes</span>)</li>
                                    </ol>

                                    <p className="mt-4">
                                        A FIN DE DESPEJAR DUDAS, CONTACTARSE AL: 0998660605
                                    </p>
                                </div>

                                <div className="pt-2 flex items-start justify-between text-[#d93025] text-xs">
                                    <p>* Indica que la pregunta es obligatoria</p>
                                </div>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-[11pt]">
                            <div className="flex justify-between items-center text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                    {googleUser ? (
                                        <>
                                            <span className="font-medium text-gray-800">{googleUser.email}</span>
                                            <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Cambiar cuenta</button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="font-medium text-gray-800">No has iniciado sesión</span>
                                            <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Iniciar sesión con Google</button>
                                        </>
                                    )}
                                </div>
                                {isSaving ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Save className="w-5 h-5 text-green-600" />}
                            </div>
                            <p className="text-gray-500 text-xs">
                                Se registrarán el nombre, la foto y el correo electrónico asociados con tu Cuenta de Google cuando subas archivos y envíes este formulario
                            </p>
                        </div>

                        {/* Step 1 Fields */}
                        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4 ${email ? 'border-l-4 border-l-blue-500' : ''}`}>
                            <label className="block text-base text-gray-900 flex items-center gap-2">
                                <Mail size={18} /> Correo electrónico <span className="text-[#d93025]">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                placeholder="Tu dirección de correo electrónico"
                                readOnly={!!googleUser}
                            />
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                            <label className="block text-base text-gray-900 flex items-center gap-2">
                                <Building size={18} /> Nombre de la Unidad Educativa <span className="text-[#d93025]">*</span>
                            </label>
                            <input
                                type="text"
                                value={institution}
                                onChange={(e) => setInstitution(e.target.value)}
                                className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                placeholder="Tu respuesta"
                            />
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                            <label className="block text-base text-gray-900 mb-4 flex items-center gap-2">
                                <Users size={18} /> Categorías <span className="text-[#d93025]">*</span>
                            </label>

                            <div className="space-y-3">
                                {["Junior", "Senior", "Master"].map((cat) => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat}
                                                checked={category === cat}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="peer appearance-none w-5 h-5 border-2 border-gray-500 rounded-full checked:border-[#673ab7] checked:border-[6px] transition-all"
                                            />
                                        </div>
                                        <span className="text-gray-800 text-[11pt]">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>


                    </>
                )}

                {step === 2 && category === 'Junior' && (
                    <>
                        {/* Step 2 Header - Junior */}
                        <div className="bg-white rounded-lg border-t-[10px] border-l-0 border-r-0 border-b-0 border-t-[#673ab7] shadow-sm relative overflow-hidden">
                            <div className="pt-6 px-6 pb-6">
                                <h1 className="text-[32px] font-normal text-black mb-2 leading-tight">CatoBots IV</h1>

                                <div className="bg-[#673ab7] text-white px-3 py-1 text-xs font-bold uppercase rounded-sm inline-block mb-4">
                                    Junior
                                </div>
                                <p className="text-gray-600 text-[11pt] border-b border-gray-200 pb-4">
                                    Nivel escolar/básico
                                </p>

                                <div className="flex justify-between items-center text-gray-600 mb-2 mt-4 text-[11pt]">
                                    <div className="flex items-center gap-1">
                                        {googleUser ? (
                                            <>
                                                <span className="font-medium text-gray-800">{googleUser.email}</span>
                                                <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Cambiar cuenta</button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="font-medium text-gray-800">No has iniciado sesión</span>
                                                <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Iniciar sesión con Google</button>
                                            </>
                                        )}
                                    </div>
                                    {isSaving ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Save className="w-5 h-5 text-green-600" />}
                                </div>
                                <p className="text-gray-500 text-xs border-b border-gray-200 pb-2">
                                    Se registrarán el nombre, la foto y el correo electrónico asociados con tu Cuenta de Google cuando subas archivos y envíes este formulario
                                </p>

                                <div className="pt-2 flex items-start justify-between text-[#d93025] text-xs">
                                    <p>* Indica que la pregunta es obligatoria</p>
                                </div>
                            </div>
                        </div>

                        {/* Junior Questions */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                            <label className="block text-base text-gray-900 mb-4">
                                Categoría Junior <span className="text-[#d93025]">*</span>
                            </label>

                            <div className="space-y-3">
                                {[
                                    "RoboFut",
                                    "Minisumo Autónomo",
                                    "Laberinto",
                                    "BattleBots 1lb",
                                    "Seguidor de Línea",
                                    "Sumo RC",
                                    "Scratch & Play: Code Masters Arena"
                                ].map((option) => (
                                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="juniorCategory"
                                                value={option}
                                                checked={juniorCategory === option}
                                                onChange={(e) => setJuniorCategory(e.target.value)}
                                                className="peer appearance-none w-5 h-5 border-2 border-gray-500 rounded-full checked:border-[#673ab7] checked:border-[6px] transition-all"
                                            />
                                        </div>
                                        <span className="text-gray-800 text-[11pt]">{option}</span>
                                    </label>
                                ))}
                            </div>


                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setShowRules(true)}
                                    className="text-[#673ab7] font-medium text-sm hover:underline flex items-center gap-1"
                                >
                                    <span className="text-lg"><FileText size={20} /></span> Ver Reglamento Junior
                                </button>
                            </div>
                        </div>
                    </>
                )}


                {
                    step === 2 && category === 'Senior' && (
                        <>
                            {/* Step 2 Header - Senior */}
                            <div className="bg-white rounded-lg border-t-[10px] border-l-0 border-r-0 border-b-0 border-t-[#673ab7] shadow-sm relative overflow-hidden">
                                <div className="pt-6 px-6 pb-6">
                                    <h1 className="text-[32px] font-normal text-black mb-2 leading-tight">CatoBots IV</h1>

                                    <div className="bg-[#673ab7] text-white px-3 py-1 text-xs font-bold uppercase rounded-sm inline-block mb-4">
                                        SENIOR
                                    </div>
                                    <p className="text-gray-600 text-[11pt] border-b border-gray-200 pb-4">
                                        Nivel bachillerato/intermedio
                                    </p>

                                    <div className="flex justify-between items-center text-gray-600 mb-2 mt-4 text-[11pt]">
                                        <div className="flex items-center gap-1">
                                            {googleUser ? (
                                                <>
                                                    <span className="font-medium text-gray-800">{googleUser.email}</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Cambiar cuenta</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-gray-800">No has iniciado sesión</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Iniciar sesión con Google</button>
                                                </>
                                            )}
                                        </div>
                                        {isSaving ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Save className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <p className="text-gray-500 text-xs border-b border-gray-200 pb-2">
                                        Se registrarán el nombre, la foto y el correo electrónico asociados con tu Cuenta de Google cuando subas archivos y envíes este formulario
                                    </p>

                                    <div className="pt-2 flex items-start justify-between text-[#d93025] text-xs">
                                        <p>* Indica que la pregunta es obligatoria</p>
                                    </div>
                                </div>
                            </div>

                            {/* Senior Questions */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900 mb-4">
                                    Categoría Senior <span className="text-[#d93025]">*</span>
                                </label>

                                <div className="space-y-3">
                                    {[
                                        "RoboFut",
                                        "Minisumo Autónomo",
                                        "Laberinto",
                                        "BattleBots 1lb",
                                        "Seguidor de Línea",
                                        "Sumo RC",
                                        "Scratch & Play: Code Masters Arena",
                                        "BioBot"
                                    ].map((option) => (
                                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="radio"
                                                    name="seniorCategory"
                                                    value={option}
                                                    checked={seniorCategory === option}
                                                    onChange={(e) => setSeniorCategory(e.target.value)}
                                                    className="peer appearance-none w-5 h-5 border-2 border-gray-500 rounded-full checked:border-[#673ab7] checked:border-[6px] transition-all"
                                                />
                                            </div>
                                            <span className="text-gray-800 text-[11pt]">{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => setShowRules(true)}
                                        className="text-[#673ab7] font-medium text-sm hover:underline flex items-center gap-1"
                                    >
                                        <span className="text-lg"><FileText size={20} /></span> Ver Reglamento Senior
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                {
                    step === 2 && category === 'Master' && (
                        <>
                            {/* Step 2 Header - Master */}
                            <div className="bg-white rounded-lg border-t-[10px] border-l-0 border-r-0 border-b-0 border-t-[#673ab7] shadow-sm relative overflow-hidden">
                                <div className="pt-6 px-6 pb-6">
                                    <h1 className="text-[32px] font-normal text-black mb-2 leading-tight">CatoBots IV</h1>

                                    <div className="bg-[#673ab7] text-white px-3 py-1 text-xs font-bold uppercase rounded-sm inline-block mb-4">
                                        MASTER
                                    </div>
                                    <p className="text-gray-600 text-[11pt] border-b border-gray-200 pb-4">
                                        Nueva categoría abierta para Universidades y<br />Clubes Independientes
                                    </p>

                                    <div className="flex justify-between items-center text-gray-600 mb-2 mt-4 text-[11pt]">
                                        <div className="flex items-center gap-1">
                                            {googleUser ? (
                                                <>
                                                    <span className="font-medium text-gray-800">{googleUser.email}</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Cambiar cuenta</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-gray-800">No has iniciado sesión</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Iniciar sesión con Google</button>
                                                </>
                                            )}
                                        </div>
                                        {isSaving ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Save className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <p className="text-gray-500 text-xs border-b border-gray-200 pb-2">
                                        Se registrarán el nombre, la foto y el correo electrónico asociados con tu Cuenta de Google cuando subas archivos y envíes este formulario
                                    </p>

                                    <div className="pt-2 flex items-start justify-between text-[#d93025] text-xs">
                                        <p>* Indica que la pregunta es obligatoria</p>
                                    </div>
                                </div>
                            </div>

                            {/* Master Questions */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900 mb-4">
                                    Categoria Master <span className="text-[#d93025]">*</span>
                                </label>

                                <div className="space-y-3">
                                    {[
                                        "Minisumo Autónomo",
                                        "Seguidor de Línea",
                                        "RoboFut Master",
                                        "BattleBots 1lb"
                                    ].map((option) => (
                                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="radio"
                                                    name="masterCategory"
                                                    value={option}
                                                    checked={masterCategory === option}
                                                    onChange={(e) => setMasterCategory(e.target.value)}
                                                    className="peer appearance-none w-5 h-5 border-2 border-gray-500 rounded-full checked:border-[#673ab7] checked:border-[6px] transition-all"
                                                />
                                            </div>
                                            <span className="text-gray-800 text-[11pt]">{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={() => setShowRules(true)}
                                        className="text-[#673ab7] font-medium text-sm hover:underline flex items-center gap-1"
                                    >
                                        <span className="text-lg"><FileText size={20} /></span> Ver Reglamento Master
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                {/* Step 3 - Junior - Robótica (RoboFut y Minisumo) */}
                {
                    step === 3 && ((category === 'Junior' && (juniorCategory === 'RoboFut' || juniorCategory === 'Minisumo Autónomo' || juniorCategory === 'Laberinto' || juniorCategory === 'BattleBots 1lb' || juniorCategory === 'Seguidor de Línea' || juniorCategory === 'Sumo RC')) || (category === 'Senior' && (seniorCategory === 'RoboFut' || seniorCategory === 'Minisumo Autónomo' || seniorCategory === 'Laberinto' || seniorCategory === 'BattleBots 1lb' || seniorCategory === 'Seguidor de Línea' || seniorCategory === 'Sumo RC')) || (category === 'Master' && (masterCategory === 'RoboFut' || masterCategory === 'Minisumo Autónomo' || masterCategory === 'Seguidor de Línea' || masterCategory === 'BattleBots 1lb' || masterCategory === 'Laberinto' || masterCategory === 'Sumo RC' || masterCategory === 'BattleBots 3lb' || masterCategory === 'BattleBots 12lb'))) && (
                        <>
                            {/* Header for Step 3 - ROBÓTICA */}
                            <div className="bg-white rounded-lg border-t-[10px] border-l-0 border-r-0 border-b-0 border-t-[#673ab7] shadow-sm relative overflow-hidden">
                                <div className="pt-6 px-6 pb-6">
                                    <h1 className="text-[32px] font-normal text-black mb-2 leading-tight">CatoBots IV</h1>

                                    <div className="bg-[#673ab7] text-white px-3 py-1 text-xs font-bold uppercase rounded-sm inline-block mb-4">
                                        ROBÓTICA
                                    </div>
                                    <p className="text-gray-600 text-[11pt] border-b border-gray-200 pb-4">
                                        {category === 'Junior' ? juniorCategory : category === 'Senior' ? seniorCategory : masterCategory}
                                    </p>

                                    <div className="flex justify-between items-center text-gray-600 mb-2 mt-4 text-[11pt]">
                                        <div className="flex items-center gap-1">
                                            {googleUser ? (
                                                <>
                                                    <span className="font-medium text-gray-800">{googleUser.email}</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Cambiar cuenta</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-gray-800">No has iniciado sesión</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Iniciar sesión con Google</button>
                                                </>
                                            )}
                                        </div>
                                        {isSaving ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Save className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <p className="text-gray-500 text-xs border-b border-gray-200 pb-2">
                                        Se registrarán el nombre, la foto y el correo electrónico asociados con tu Cuenta de Google cuando subas archivos y envíes este formulario
                                    </p>

                                    <div className="pt-2 flex items-start justify-between text-[#d93025] text-xs">
                                        <p>* Indica que la pregunta es obligatoria</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900 flex items-center gap-2">
                                    <Bot size={18} /> Nombre del Robot <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={robotName}
                                    onChange={(e) => setRobotName(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900 flex items-center gap-2">
                                    <Users size={18} /> Integrantes (2 Estudiantes) <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={members}
                                    onChange={(e) => setMembers(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900 flex items-center gap-2">
                                    <User size={18} /> Nombre del Asesor (Robótica) <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={advisorName}
                                    onChange={(e) => setAdvisorName(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900 flex items-center gap-2">
                                    <Phone size={18} /> Teléfono del Asesor (Robótica) <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={advisorPhone}
                                    onChange={(e) => setAdvisorPhone(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>
                        </>
                    )
                }

                {/* Step 3 - Junior - Scratch & Play */}
                {
                    step === 3 && ((category === 'Junior' && juniorCategory === 'Scratch & Play: Code Masters Arena') || (category === 'Senior' && seniorCategory === 'Scratch & Play: Code Masters Arena')) && (
                        <>
                            {/* Header for Step 3 - SCRATCH & PLAY */}
                            <div className="bg-white rounded-lg border-t-[10px] border-l-0 border-r-0 border-b-0 border-t-[#673ab7] shadow-sm relative overflow-hidden">
                                <div className="pt-6 px-6 pb-6">
                                    <h1 className="text-[32px] font-normal text-black mb-2 leading-tight">CatoBots IV</h1>

                                    <div className="bg-[#673ab7] text-white px-3 py-1 text-xs font-bold uppercase rounded-sm inline-block mb-4">
                                        Scratch & Play
                                    </div>
                                    <p className="text-gray-600 text-[11pt] border-b border-gray-200 pb-4">
                                        Code Masters Arena
                                    </p>

                                    <div className="flex justify-between items-center text-gray-600 mb-2 mt-4 text-[11pt]">
                                        <div className="flex items-center gap-1">
                                            {googleUser ? (
                                                <>
                                                    <span className="font-medium text-gray-800">{googleUser.email}</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Cambiar cuenta</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-gray-800">No has iniciado sesión</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Iniciar sesión con Google</button>
                                                </>
                                            )}
                                        </div>
                                        {isSaving ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Save className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <p className="text-gray-500 text-xs border-b border-gray-200 pb-2">
                                        Se registrarán el nombre, la foto y el correo electrónico asociados con tu Cuenta de Google cuando subas archivos y envíes este formulario
                                    </p>

                                    <div className="pt-2 flex items-start justify-between text-[#d93025] text-xs">
                                        <p>* Indica que la pregunta es obligatoria</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900">
                                    Nombre del Equipo <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900 flex items-center gap-2">
                                    <Users size={18} /> Integrantes (2 Estudiantes) <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={members}
                                    onChange={(e) => setMembers(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900">
                                    Nombre del Asesor (Scratch & Play ) <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={advisorName}
                                    onChange={(e) => setAdvisorName(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900">
                                    Teléfono del Asesor (Scratch & Play ) <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={advisorPhone}
                                    onChange={(e) => setAdvisorPhone(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>
                        </>
                    )
                }

                {/* Step 3 - Senior - BioBot */}
                {
                    step === 3 && ((category === 'Senior' && seniorCategory === 'BioBot') || (category === 'Master' && masterCategory === 'BioBot')) && (
                        <>
                            {/* Header for Step 3 - BIOBOT */}
                            <div className="bg-white rounded-lg border-t-[10px] border-l-0 border-r-0 border-b-0 border-t-[#673ab7] shadow-sm relative overflow-hidden">
                                <div className="pt-6 px-6 pb-6">
                                    <h1 className="text-[32px] font-normal text-black mb-2 leading-tight">CatoBots IV</h1>

                                    <div className="bg-[#673ab7] text-white px-3 py-1 text-xs font-bold uppercase rounded-sm inline-block mb-4">
                                        BioBot
                                    </div>

                                    <div className="flex justify-between items-center text-gray-600 mb-2 mt-4 text-[11pt]">
                                        <div className="flex items-center gap-1">
                                            {googleUser ? (
                                                <>
                                                    <span className="font-medium text-gray-800">{googleUser.email}</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Cambiar cuenta</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-gray-800">No has iniciado sesión</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Iniciar sesión con Google</button>
                                                </>
                                            )}
                                        </div>
                                        {isSaving ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Save className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <p className="text-gray-500 text-xs border-b border-gray-200 pb-2">
                                        Se registrarán el nombre, la foto y el correo electrónico asociados con tu Cuenta de Google cuando subas archivos y envíes este formulario
                                    </p>

                                    <div className="pt-2 flex items-start justify-between text-[#d93025] text-xs">
                                        <p>* Indica que la pregunta es obligatoria</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900">
                                    Nombre del Equipo <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900">
                                    Integrantes (2 integrantes) <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={members}
                                    onChange={(e) => setMembers(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900">
                                    Nombre del Asesor (BioBot) <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={advisorName}
                                    onChange={(e) => setAdvisorName(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900">
                                    Teléfono del Asesor ( BioBot) <span className="text-[#d93025]">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={advisorPhone}
                                    onChange={(e) => setAdvisorPhone(e.target.value)}
                                    className="w-full border-b border-gray-200 focus:border-b-2 focus:border-[#673ab7] outline-none py-1 transition-colors bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Tu respuesta"
                                />
                            </div>
                        </>
                    )
                }

                {/* Step 4 - Payment Information */}
                {
                    step === 4 && (
                        <>
                            <div className="bg-white rounded-lg border-t-[10px] border-l-0 border-r-0 border-b-0 border-t-[#673ab7] shadow-sm relative overflow-hidden">
                                <div className="pt-6 px-6 pb-6">
                                    <h1 className="text-[32px] font-normal text-black mb-2 leading-tight">INFORMACIÓN DE PAGO</h1>

                                    <div className="text-gray-800 text-[11pt] space-y-4 mb-4">
                                        <p className="font-bold">Instrucciones para la inscripción:</p>
                                        <p>El costo de participación es de $10.00 por Institución. Para completar su registro, realice el depósito o transferencia y adjunte el comprobante al final de este formulario.</p>

                                        <p className="font-bold mt-4">💳 Datos de la Cuenta</p>
                                        <p>Puedes tomar una captura de pantalla a estos datos o una foto para tenerlos a mano al momento de realizar el pago.</p>

                                        <div className="flex justify-center my-4">
                                            <img src="/src/assets/pago.png" alt="Datos de la Cuenta" className="max-w-full h-auto rounded shadow-sm border border-gray-200" />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-gray-600 mb-2 mt-4 text-[11pt]">
                                        <div className="flex items-center gap-1">
                                            {googleUser ? (
                                                <>
                                                    <span className="font-medium text-gray-800">{googleUser.email}</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Cambiar cuenta</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-gray-800">No has iniciado sesión</span>
                                                    <button onClick={() => handleGoogleLogin()} className="text-blue-600 hover:text-blue-800 ml-1">Iniciar sesión con Google</button>
                                                </>
                                            )}
                                        </div>
                                        {isSaving ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Save className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <p className="text-gray-500 text-xs border-b border-gray-200 pb-2">
                                        Se registrarán el nombre, la foto y el correo electrónico asociados con tu Cuenta de Google cuando subas archivos y envíes este formulario
                                    </p>

                                    <div className="pt-2 flex items-start justify-between text-[#d93025] text-xs">
                                        <p>* Indica que la pregunta es obligatoria</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
                                <label className="block text-base text-gray-900 font-medium flex items-center gap-2">
                                    <Upload size={18} /> Carga de Comprobante
                                </label>
                                <p className="text-sm text-gray-600">
                                    Por favor, suba una foto legible o el PDF de la transferencia.
                                </p>

                                <div className="mt-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sube 1 archivo compatible: PDF o image. El tamaño máximo es de 10 MB. <span className="text-[#d93025]">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={async (e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                const file = e.target.files[0];
                                                if (file.size > 10 * 1024 * 1024) {
                                                    alert("El archivo es demasiado grande (máximo 10MB)");
                                                    e.target.value = "";
                                                    return;
                                                }
                                                // Upload immediately
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                try {
                                                    const res = await fetch('/api/registrations/upload', {
                                                        method: 'POST',
                                                        body: formData
                                                    });
                                                    const data = await res.json();
                                                    if (data.filename) {
                                                        setPaymentProof(data.filename);
                                                    }
                                                } catch (error) {
                                                    console.error("Upload failed", error);
                                                    alert("Error al subir archivo");
                                                }
                                            }
                                        }}
                                        className="block w-full text-sm text-gray-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-md file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-[#673ab7] file:text-white
                                      hover:file:bg-[#5b32a3]
                                    "
                                    />
                                    {paymentProof && (
                                        <p className="mt-2 text-sm text-green-600">
                                            Archivo cargado: {paymentProof}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )
                }

                {/* Step 5 - Terms and Conditions */}
                {
                    step === 5 && (
                        <>
                            <div className="bg-white rounded-lg border-t-[10px] border-l-0 border-r-0 border-b-0 border-t-[#673ab7] shadow-sm relative overflow-hidden">
                                <div className="pt-6 px-6 pb-6">
                                    <h1 className="text-[32px] font-normal text-black mb-2 leading-tight">CatoBots IV</h1>

                                    <div className="flex justify-between items-center text-gray-600 mb-2 mt-4 text-[11pt]">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium text-gray-800">alexis0991768994@gmail.com</span>
                                            <a href="#" className="text-blue-600 hover:text-blue-800 ml-1">Cambiar cuenta</a>
                                        </div>
                                        {isSaving ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Save className="w-5 h-5 text-green-600" />}
                                    </div>
                                    <p className="text-gray-500 text-xs border-b border-gray-200 pb-2">
                                        Se registrarán el nombre, la foto y el correo electrónico asociados con tu Cuenta de Google cuando subas archivos y envíes este formulario
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border-t-[10px] border-l-0 border-r-0 border-b-0 border-t-[#673ab7] shadow-sm relative overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-[24px] font-normal text-black mb-4">Sección sin título</h2>

                                    <div className="space-y-4">
                                        <p className="font-medium text-gray-900">Términos y Condiciones</p>
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="terms"
                                                    type="checkbox"
                                                    checked={termsAccepted}
                                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                                    className="w-4 h-4 text-[#673ab7] border-gray-300 rounded focus:ring-[#673ab7]"
                                                />
                                            </div>
                                            <label htmlFor="terms" className="text-sm text-gray-700">
                                                He leido y aceptos las bases que rigen este concurso en su convocatoria general
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }

                {/* Footer Actions */}
                <div className="flex justify-between items-center py-2">
                    <div className="flex gap-2">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="text-[#673ab7] text-sm font-medium px-6 py-2 rounded-[4px] hover:bg-[#673ab7]/10 transition-colors"
                            >
                                Atrás
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="bg-[#673ab7] text-white px-6 py-2 rounded-[4px] text-sm font-medium hover:bg-[#5b32a3] transition-colors shadow-sm"
                        >
                            {step === 5 ? 'Enviar' : 'Siguiente'}
                        </button>
                    </div>

                    <button
                        onClick={handleClear}
                        className="text-[#673ab7] text-sm font-medium px-2 py-2 rounded hover:bg-[#673ab7]/10 transition-colors"
                    >
                        Borrar formulario
                    </button>
                </div>

                {/* Footer Disclaimer */}
                <div className="text-[11px] text-gray-500 mt-4 space-y-1">
                    <p>Nunca envíes contraseñas a través de Formularios de Google.</p>
                    <div className="text-center pt-2">
                        <p>Google no creó ni aprobó este contenido. - <a href="#" className="underline">Comunicarse con el propietario del formulario</a> - <a href="#" className="underline">Condiciones del Servicio</a> - <a href="#" className="underline">Política de Privacidad</a></p>
                        <p className="mt-4">Google Formularios</p>
                    </div>
                </div>

            </div>

            {
                showRules && (
                    <Rules category={category} onClose={() => setShowRules(false)} />
                )
            }
        </div>
    );
}
