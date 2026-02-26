import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import WizardLayout from "./WizardLayout";
import Step1_EventDetails from "./steps/Step1_EventDetails";
import Step2_Category from "./steps/Step2_Category";
import Step3_SubCategory from "./steps/Step3_SubCategory";
import Step4_Details from "./steps/Step4_Details";
import Step5_Payment from "./steps/Step5_Payment";
import Step6_Summary from "./steps/Step6_Summary";
import Rules from "../Form/Regulations/rules";
import { Loader2 } from "lucide-react";
import { api } from "../../config/api";

export default function WizardForm() {
    const { googleUser, loginGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [showRules, setShowRules] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        institution: "",
        category: "",
        juniorCategory: "",
        seniorCategory: "",
        masterCategory: "",
        robotName: "",
        robotAbbreviation: "",
        teamName: "",
        members: "",
        advisorName: "",
        advisorPhone: "",
        paymentProof: null as string | null,
        termsAccepted: false
    });

    const updateData = (newData: any) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    // --- Authentication Logic (Copied from OldForm) ---
    const processLogin = (userObj: any) => {
        loginGoogle(userObj);
        updateData({ email: userObj.email });
    };

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

    // --- Persistence Logic ---
    useEffect(() => {
        if (googleUser?.email) {
            updateData({ email: googleUser.email });
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, [googleUser]);

    const saveDraft = async (stepToSave: number) => {
        const email = formData.email || googleUser?.email;
        if (!email) return;

        try {
            await api.post('/api/registrations/sync', {
                email: email,
                step: stepToSave,
                data: formData,
                paymentProof: formData.paymentProof
            });
        } catch (error) {
            console.error("Failed to save draft", error);
        }
    };

    // --- Navigation Handlers ---
    const handleNext = () => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        saveDraft(nextStep);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        const prevStep = currentStep - 1;
        setCurrentStep(prevStep);
        saveDraft(prevStep);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        const email = formData.email || googleUser?.email;
        
        if (!email) {
            alert('Por favor, ingresa tu correo electrónico o inicia sesión con Google.');
            return;
        }
        
        console.log('handleSubmit called, email:', email);
        
        try {
            const response = await api.post('/api/registrations/submit', { email })
            console.log('response status:', response.status);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Error ${response.status}`)
            }
            alert("¡Inscripción enviada exitosamente! Nos vemos en la competencia.");
            window.location.reload();
        } catch (error: any) {
            console.error("Submit failed", error);
            alert(`Error al enviar el formulario: ${error.message}`);
        }
    };

    // --- Step Rendering Helpers ---
    // Determine category type for Step 4
    const getCategoryType = () => {
        const { category, juniorCategory, seniorCategory } = formData;

        const selection = category === "Junior" ? juniorCategory
            : category === "Senior" ? seniorCategory
                : ""; // Master usually falls into Robotica logic mostly?

        if (selection.includes("Scratch")) return "SCRATCH";
        if (selection.includes("BioBot")) return "BIOBOT"; // Only senior/master?
        return "ROBOTICA"; // Default
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-purple-500 w-10 h-10" />
            </div>
        );
    }

    const steps = [
        { id: 1, title: "Categoría", description: "Nivel de competencia" },
        { id: 2, title: "Datos", description: "Institución y Contacto" },
        { id: 3, title: "Competencia", description: "Selección específica" },
        { id: 4, title: "Detalles", description: "Equipo y asesor" },
        { id: 5, title: "Pago", description: "Comprobante" },
        { id: 6, title: "Confirmar", description: "Revisión final" },
    ];

    return (
        <WizardLayout
            currentStep={currentStep}
            totalSteps={6}
            steps={steps}
            title="CatoBots IV"
            subtitle="Formulario de Inscripción Oficial"
        >
            {currentStep === 1 && (
                <Step2_Category
                    data={formData}
                    updateData={updateData}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    showBackButton={false}
                />
            )}

            {currentStep === 2 && (
                <Step1_EventDetails
                    data={formData}
                    updateData={updateData}
                    googleUser={googleUser}
                    handleGoogleLogin={() => handleGoogleLogin()}
                    handleNext={handleNext}
                    handleBack={handleBack}
                />
            )}

            {currentStep === 3 && (
                <Step3_SubCategory
                    data={formData}
                    updateData={updateData}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    setShowRules={setShowRules}
                />
            )}

            {currentStep === 4 && (
                <Step4_Details
                    data={formData}
                    categoryType={getCategoryType()}
                    updateData={updateData}
                    handleNext={handleNext}
                    handleBack={handleBack}
                />
            )}

            {currentStep === 5 && (
                <Step5_Payment
                    data={formData}
                    updateData={updateData}
                    handleNext={handleNext}
                    handleBack={handleBack}
                />
            )}

            {currentStep === 6 && (
                <Step6_Summary
                    data={formData}
                    categoryType={getCategoryType()}
                    updateData={updateData}
                    handleBack={handleBack}
                    handleSubmit={handleSubmit}
                />
            )}

            {showRules && (
                <Rules 
                    category={formData.category} 
                    subCategory={formData.category === "Junior" ? formData.juniorCategory : formData.category === "Senior" ? formData.seniorCategory : formData.masterCategory}
                    onClose={() => setShowRules(false)} 
                />
            )}
        </WizardLayout>
    );
}
