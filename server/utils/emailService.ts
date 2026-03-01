import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Log email configuration on startup
console.log('=== Email Configuration ===');
console.log('Email Provider: Resend');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***SET***' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'onboarding@resend.dev');
console.log('===========================');

const CATO_BOTS_LOGO_URL = 'https://catobots.com/logo.png';
const ROBOT_ICON_URL = 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png';

const rulesUrls: Record<string, string> = {
    'RoboFut': "https://ucacueedu-my.sharepoint.com/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7BABC9DD7A-3FCE-409D-ABCA-E0D90576CBBA%7D&file=Reglas_Robofut.docx&action=default&mobileredirect=true&CT=1771016156656&OR=ItemsView",
    'RoboFut Master': "https://ucacueedu-my.sharepoint.com/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7BABC9DD7A-3FCE-409D-ABCA-E0D90576CBBA%7D&file=Reglas_Robofut.docx&action=default&mobileredirect=true&CT=1771016156656&OR=ItemsView",
    'Minisumo Autónomo': "https://ucacueedu-my.sharepoint.com/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fnathalia%5Fperalta%5Fucacue%5Fedu%5Fec%2FDocuments%2F1%2E%20Unidad%20Academica%20de%20Informatica%2C%20ciencias%20de%20la%20computaci%C3%B3n%20e%20innovacion%20tecnologica%2FGestion%20de%20proyectos%2FCatoBots%2FIII%20Edicion%2FReglamentos&ga=1",
    'Laberinto': "https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7B8B8E0F68-2D21-4C00-979A-7195CBF59F2A%7D&file=ReglamentoLaberinto_v1.docx&action=default&mobileredirect=true",
    'BattleBots 1lb': "https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7B84E15B97-6EE4-4462-B0F5-CAD12491D94F%7D&file=BattleBots.docx&action=default&mobileredirect=true",
    'Seguidor de Línea': "https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7BCAE4B9A8-D383-41E6-9AB8-2DF7FCBE172C%7D&file=ReglamentoSeguidordeLinea.docx&action=default&mobileredirect=true",
    'Sumo RC': "https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7BE504FB42-63DE-4F59-81F4-39B0B7B477DD%7D&file=ReglamentoSumoRC.docx&action=default&mobileredirect=true",
    'Scratch & Play: Code Masters Arena': "https://ucacueedu-my.sharepoint.com/:w:/r/personal/nathalia_peralta_ucacue_edu_ec/_layouts/15/Doc.aspx?sourcedoc=%7B964F0D59-F202-4681-BFAD-FA11CCEDEC2C%7D&file=Scratch%20%26%20Play%20-%20Code%20Masters%20Arena.docx&action=default&mobileredirect=true",
    'BioBot': "#"
};

const getBaseStyle = () => `
    font-family: 'Montserrat', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #000000;
    color: #FFFFFF;
    margin: 0;
    padding: 20px;
`;

const getContainerStyle = () => `
    max-width: 600px;
    margin: 0 auto;
    background-color: #111111;
    border: 4px solid #000000;
`;

export const sendWelcomeEmail = async (to: string, formData: any) => {
    console.log('\n=== sendWelcomeEmail called ===');
    console.log('To:', to);
    console.log('FormData:', JSON.stringify(formData, null, 2));
    
    // Extract category from formData. Forms save specific subcategories based on the main category.
    const uniqueCategories: string[] = [];
    if (formData?.juniorCategory) uniqueCategories.push(formData.juniorCategory);
    if (formData?.seniorCategory) uniqueCategories.push(formData.seniorCategory);
    if (formData?.masterCategory) uniqueCategories.push(formData.masterCategory);
    // If none of those matched but a general category string is somehow passed (like "Minisumo Autónomo")
    if (formData?.category && typeof formData.category === 'string' && !['Junior', 'Senior', 'Master'].includes(formData.category)) {
        uniqueCategories.push(formData.category);
    }
    
    console.log('Categories detected:', uniqueCategories);

    const rulesLinksHtml = uniqueCategories.map(cat => {
        const url = rulesUrls[cat];
        if (url) {
            return `<a href="${url}" style="display: inline-block; background-color: #000000; color: #FFF000; padding: 12px 20px; text-decoration: none; font-weight: 900; font-size: 14px; margin: 5px; border: 2px solid #FFF000; text-transform: uppercase; letter-spacing: 1px;">📜 REGLAS ${cat}</a>`;
        }
        return '';
    }).join('');

    const htmlContent = `
    <div style="${getBaseStyle()}">
        <div style="${getContainerStyle()}; box-shadow: 8px 8px 0px #10B961;">
            
            <!-- HEADER -->
            <div style="background-color: #10B961; padding: 40px 20px; text-align: center; border-bottom: 4px solid #000000; position: relative;">
                <img src="${ROBOT_ICON_URL}" alt="CatoBots" style="width: 80px; height: 80px; margin-bottom: 20px; filter: drop-shadow(4px 4px 0px #000000);" />
                <h1 style="color: #FFF000; margin: 0; font-size: 32px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #000000;">¡TRANSMISIÓN RECIBIDA!</h1>
                <p style="color: #000000; font-weight: 900; margin-top: 5px; text-transform: uppercase; letter-spacing: 3px; font-size: 14px;">SECUENCIA DE INSCRIPCIÓN</p>
            </div>
            
            <!-- CONTENT -->
            <div style="padding: 40px 30px; background-color: #111111;">
                <p style="font-size: 16px; line-height: 1.6; color: #FFFFFF; margin-bottom: 24px; font-weight: 500; text-transform: uppercase;">
                    ATENCIÓN COMANDANTE:<br><br>
                    HEMOS RECIBIDO TUS DATOS DE INSCRIPCIÓN PARA LA <span style="color: #10B961; font-weight: 900;">IV EDICIÓN DE CATOBOTS</span>.
                </p>

                ${rulesLinksHtml ? `
                <div style="background-color: #000000; border-left: 8px solid #FFF000; padding: 25px; margin-bottom: 30px;">
                    <h3 style="color: #FFFFFF; margin-top: 0; margin-bottom: 15px; font-size: 18px; font-weight: 900; text-transform: uppercase;">📚 NORMATIVA DE COMBATE</h3>
                    <p style="font-size: 14px; color: #A3A3A3; margin-bottom: 20px; text-transform: uppercase; font-weight: bold;">ACCEDE A TUS MANUALES OFICIALES ANTES DE ENTRAR A LA ARENA:</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${rulesLinksHtml}
                    </div>
                </div>
                ` : ''}

                <div style="background-color: #FFF000; border: 4px solid #000000; padding: 20px; box-shadow: 4px 4px 0px #10B961;">
                    <p style="font-size: 16px; color: #000000; margin: 0; font-weight: 900; text-transform: uppercase;">
                        ⏳ ESTADO DE OPERACIÓN: VERIFICANDO FONDOS<br><br>
                        <span style="font-weight: 500; font-size: 14px;">NUESTROS SISTEMAS ESTÁN REVISANDO TU PAGO. RECIBIRÁS OTRA ALERTA EN CUANTO EL CENTRO DE MANDO APRUEBE O RECHACE TU SOLICITUD.</span>
                    </p>
                </div>
            </div>

            <!-- FOOTER -->
            <div style="background-color: #000000; padding: 20px; text-align: center; border-top: 4px solid #000000;">
                <p style="color: #10B961; font-size: 12px; margin: 0; font-weight: 900; letter-spacing: 2px;">© 2026 CATOBOTS | HIGH ENERGY ESPORTS</p>
            </div>
            
        </div>
    </div>
    `;

    try {
        if (!process.env.RESEND_API_KEY) {
            console.log('⚠️ No RESEND_API_KEY found, skipping welcome email to:', to);
            return;
        }

        console.log('📧 Attempting to send welcome email to:', to);
        console.log('📧 From:', process.env.EMAIL_FROM || 'onboarding@resend.dev');
        
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to,
            subject: "¡Inscripción Recibida! - CatoBots IV",
            html: htmlContent,
        });
        
        if (error) {
            console.error('❌ Resend error:', error);
            return;
        }
        
        console.log('✅ Welcome email sent successfully!');
        console.log('   Message ID:', data?.id);
    } catch (error: any) {
        console.error('❌ Error sending welcome email:');
        console.error('   Error message:', error.message);
        console.error('   Full error:', error);
    }
};

export const sendStatusEmail = async (to: string, status: 'APPROVED' | 'REJECTED', formData?: any) => {
    const isApproved = status === 'APPROVED';
    const statusColor = isApproved ? '#10B961' : '#DC2626'; // Vibrant Green or Deep Red
    const titleColor = isApproved ? '#FFF000' : '#FFFFFF';
    const title = isApproved ? '¡ACREDITACIÓN APROBADA!' : '¡SOLICITUD RECHAZADA!';
    const bgHeader = isApproved ? '#10B961' : '#DC2626';
    const message = isApproved
        ? '¡EXCELENTES NOTICIAS COMANDANTE! TU PAGO HA SIDO VERIFICADO Y TU UNIDAD ESTÁ OFICIALMENTE REGISTRADA PARA EL COMBATE EN CATOBOTS IV.'
        : 'ENCONTRAMOS UN PROBLEMA. TU PAGO NO PUDO SER VERIFICADO Y TU INSCRIPCIÓN HA SIDO RECHAZADA. COMUNÍCATE INMEDIATAMENTE CON EL CENTRO DE MANDO PARA RESOLVER ESTO.';

    const htmlContent = `
    <div style="${getBaseStyle()}">
        <div style="${getContainerStyle()}; box-shadow: 8px 8px 0px ${statusColor};">
            
            <!-- HEADER -->
            <div style="background-color: ${bgHeader}; padding: 40px 20px; text-align: center; border-bottom: 4px solid #000000;">
                <img src="${ROBOT_ICON_URL}" alt="CatoBots" style="width: 80px; height: 80px; margin-bottom: 20px; filter: drop-shadow(4px 4px 0px #000000);" />
                <h1 style="color: ${titleColor}; margin: 0; font-size: 30px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: 2px; text-shadow: 3px 3px 0px #000000;">${title}</h1>
                <p style="color: #000000; font-weight: 900; margin-top: 5px; text-transform: uppercase; letter-spacing: 3px; font-size: 14px;">ACTUALIZACIÓN DE ESTADO</p>
            </div>
            
            <!-- CONTENT -->
            <div style="padding: 40px 30px; background-color: #111111;">
                <p style="font-size: 16px; line-height: 1.6; color: #FFFFFF; margin-bottom: 24px; font-weight: 500; text-transform: uppercase;">
                    ATENCIÓN COMANDANTE:<br><br>
                    TENEMOS NUEVA INFORMACIÓN SOBRE TU EXPEDIENTE DE INSCRIPCIÓN PARA LA <span style="color: #10B961; font-weight: 900;">IV EDICIÓN</span>.
                    ${formData?.category ? `<br><br><span style="color: ${titleColor};">CATEGORÍA ASIGNADA: ${formData.category} ${formData.juniorCategory || formData.seniorCategory || formData.masterCategory || ''}</span>` : ''}
                </p>

                <div style="background-color: ${isApproved ? '#10B961' : '#DC2626'}; border: 4px solid #000000; padding: 25px; box-shadow: 4px 4px 0px #000000;">
                    <p style="font-size: 18px; color: ${isApproved ? '#000000' : '#FFFFFF'}; margin: 0; font-weight: 900; text-align: center; text-transform: uppercase; line-height: 1.5;">
                        ${message}
                    </p>
                </div>
            </div>

            <!-- FOOTER -->
            <div style="background-color: #000000; padding: 20px; text-align: center; border-top: 4px solid #000000;">
                <p style="color: ${statusColor}; font-size: 12px; margin: 0; font-weight: 900; letter-spacing: 2px;">© 2026 CATOBOTS | HIGH ENERGY ESPORTS</p>
            </div>
            
        </div>
    </div>
    `;

    try {
        if (!process.env.RESEND_API_KEY) {
            console.log('No RESEND_API_KEY found, skipping status email to:', to);
            return;
        }

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to,
            subject: `Actualización de Inscripción: ${title} - CatoBots IV`,
            html: htmlContent,
        });
        
        if (error) {
            console.error('Resend error:', error);
            return;
        }
        
        console.log(`✅ Status email (${status}) sent to ${to}, ID: ${data?.id}`);
    } catch (error) {
        console.error('Error sending status email:', error);
    }
};
