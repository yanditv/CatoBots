import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const CATO_BOTS_LOGO_URL = 'https://catobots.com/logo.png'; // Make sure to replace this with an actual public URL or base64
// Alternatively, embed as base64 or a sleek robot icon URL
const ROBOT_ICON_URL = 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png'; // Reliable minimalist modern robot head icon

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
    font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #0a0a0a;
    color: #e5e5e5;
    margin: 0;
    padding: 0;
`;

const getContainerStyle = () => `
    max-width: 600px;
    margin: 40px auto;
    background-color: #171717;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    border: 1px solid #262626;
`;

export const sendWelcomeEmail = async (to: string, formData: any) => {
    // Extract category from formData. Forms save specific subcategories based on the main category.
    const uniqueCategories: string[] = [];
    if (formData?.juniorCategory) uniqueCategories.push(formData.juniorCategory);
    if (formData?.seniorCategory) uniqueCategories.push(formData.seniorCategory);
    if (formData?.masterCategory) uniqueCategories.push(formData.masterCategory);
    // If none of those matched but a general category string is somehow passed (like "Minisumo Autónomo")
    if (formData?.category && typeof formData.category === 'string' && !['Junior', 'Senior', 'Master'].includes(formData.category)) {
        uniqueCategories.push(formData.category);
    }

    const rulesLinksHtml = uniqueCategories.map(cat => {
        const url = rulesUrls[cat];
        if (url) {
            return `<a href="${url}" style="display: inline-block; background-color: #262626; color: #a855f7; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 5px;">📜 Reglas ${cat}</a>`;
        }
        return '';
    }).join('');

    const htmlContent = `
    <div style="${getBaseStyle()}">
        <div style="${getContainerStyle()}">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%); padding: 40px 20px; text-align: center;">
                <img src="${ROBOT_ICON_URL}" alt="CatoBots" style="width: 80px; height: 80px; margin-bottom: 20px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));" />
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">¡Inscripción Finalizada!</h1>
            </div>
            
            <div style="padding: 40px 30px;">
                <p style="font-size: 16px; line-height: 1.6; color: #d4d4d4; margin-bottom: 24px;">
                    Hola, nos alegra informarte que hemos recibido tu inscripción a <strong>CatoBots IV Edición</strong> exitosamente.
                </p>

                ${rulesLinksHtml ? `
                <div style="background-color: #1f1f1f; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                    <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 15px; font-size: 16px;">📚 Repasa los Reglamentos</h3>
                    <p style="font-size: 14px; color: #a3a3a3; margin-bottom: 15px;">Hemos detectado las categorías en las que participas. Aquí tienes acceso directo a tus reglamentos:</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${rulesLinksHtml}
                    </div>
                </div>
                ` : ''}

                <div style="background-color: #3b0764; border-left: 4px solid #a855f7; padding: 16px 20px; border-radius: 4px 8px 8px 4px;">
                    <p style="font-size: 15px; color: #e9d5ff; margin: 0; font-weight: 500;">
                        ⏳ <strong>Estado:</strong> Estamos verificando tu pago. Te enviaremos otro correo en cuanto el panel administrativo apruebe o rechace tu inscripción.
                    </p>
                </div>
            </div>

            <div style="background-color: #0f0f0f; padding: 20px; text-align: center; border-top: 1px solid #262626;">
                <p style="color: #737373; font-size: 13px; margin: 0;">© 2026 CatoBots. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
    `;

    try {
        if (!process.env.SMTP_USER) {
            console.log('No SMTP config found, skipping welcome email to:', to);
            return;
        }

        await transporter.sendMail({
            from: `"CatoBots" <${process.env.SMTP_USER}>`,
            to,
            subject: "¡Inscripción Recibida! - CatoBots IV",
            html: htmlContent,
        });
        console.log(`Welcome email sent to ${to}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

export const sendStatusEmail = async (to: string, status: 'APPROVED' | 'REJECTED') => {
    const isApproved = status === 'APPROVED';
    const statusColor = isApproved ? '#22c55e' : '#ef4444'; // Green or Red
    const statusBg = isApproved ? '#14532d' : '#7f1d1d';
    const title = isApproved ? 'Pago Aprobado' : 'Pago Rechazado';
    const message = isApproved
        ? '¡Excelentes noticias! Tu pago ha sido verificado y tu inscripción está oficialmente aprobada. Estás listo para competir en CatoBots IV.'
        : 'Lo sentimos, ha habido un problema al verificar tu pago y tu inscripción ha sido rechazada. Por favor, comunícate con la organización para resolver este inconveniente.';

    const htmlContent = `
    <div style="${getBaseStyle()}">
        <div style="${getContainerStyle()}">
            <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusBg} 100%); padding: 40px 20px; text-align: center;">
                <img src="${ROBOT_ICON_URL}" alt="CatoBots" style="width: 80px; height: 80px; margin-bottom: 20px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));" />
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">${title}</h1>
            </div>
            
            <div style="padding: 40px 30px;">
                <p style="font-size: 16px; line-height: 1.6; color: #d4d4d4; margin-bottom: 24px;">
                    Hola, te contactamos para informarte sobre el estado de tu inscripción a <strong>CatoBots IV Edición</strong>.
                </p>

                <div style="background-color: ${isApproved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border: 1px solid ${statusColor}; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                    <p style="font-size: 16px; color: #ffffff; margin: 0; font-weight: 500; text-align: center;">
                        ${message}
                    </p>
                </div>
            </div>

            <div style="background-color: #0f0f0f; padding: 20px; text-align: center; border-top: 1px solid #262626;">
                <p style="color: #737373; font-size: 13px; margin: 0;">© 2026 CatoBots. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
    `;

    try {
        if (!process.env.SMTP_USER) {
            console.log('No SMTP config found, skipping status email to:', to);
            return;
        }

        await transporter.sendMail({
            from: `"CatoBots" <${process.env.SMTP_USER}>`,
            to,
            subject: `Actualización de Inscripción: ${title} - CatoBots IV`,
            html: htmlContent,
        });
        console.log(`Status email (${status}) sent to ${to}`);
    } catch (error) {
        console.error('Error sending status email:', error);
    }
};
