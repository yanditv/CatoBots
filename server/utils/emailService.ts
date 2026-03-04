import { Resend } from 'resend';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Log email configuration on startup
console.log('=== Email Configuration ===');
console.log('Email Provider: Resend');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***SET***' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'onboarding@resend.dev');
console.log('===========================');

// --- Logo ---
// Localhost URLs do not work in emails. Use the remote logo URL defined in .env
const CATO_BOTS_LOGO_URL = process.env.CATO_BOTS_LOGO_URL || 'https://raw.githubusercontent.com/yanditv/CatoBots/main/frondend/public/logo-yellow.png';

import { Category } from '../models/Category';
import { EventConfig } from '../models/EventConfig';

// Dynamically fetch rules URLs from the database
const getRulesUrls = async (): Promise<Record<string, string>> => {
    try {
        const categories = await Category.findAll({ where: { isActive: true } });
        const urls: Record<string, string> = {};
        categories.forEach((c: any) => {
            if (c.rulesUrl) urls[c.name] = c.rulesUrl;
        });
        return urls;
    } catch {
        console.error('Failed to fetch category rules URLs');
        return {};
    }
};

// Dynamically fetch event config from the database
const getEventConfig = async (): Promise<Record<string, string>> => {
    try {
        const configs = await EventConfig.findAll();
        const result: Record<string, string> = {};
        configs.forEach((c: any) => { result[c.key] = c.value; });
        return result;
    } catch {
        console.error('Failed to fetch event config');
        return {};
    }
};

const getLogoImgTag = (width: number = 160) => {
    return `<img src="${CATO_BOTS_LOGO_URL}" alt="CATOBOTS IV" width="${width}" style="display: block; margin: 0 auto; max-width: ${width}px; height: auto;" />`;
};

// ============================================================
// DESIGN SYSTEM — CatoBots Grunge/eSports (Inline CSS for email)
// ============================================================
// Colors: Green #10B961, Yellow #FFF000, Black #000000, White #FFFFFF, Dark #111111
// Font: Montserrat fallback stack (email-safe)
// Style: Solid block shadows, warning tape, uppercase, aggressive typography

const warningTapeStyle = `background: repeating-linear-gradient(-45deg, #FFD400, #FFD400 10px, #000000 10px, #000000 20px); height: 8px; width: 100%;`;

const buildEmailHtml = (opts: {
    headerBg: string;
    headerTitle: string;
    headerSubtitle: string;
    titleColor: string;
    bodyContent: string;
    accentColor: string;
}) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Montserrat', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 20px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #111111; border: 4px solid #000000; box-shadow: 8px 8px 0px ${opts.accentColor};">
                    
                    <!-- WARNING TAPE TOP -->
                    <tr><td style="${warningTapeStyle}"></td></tr>

                    <!-- HEADER -->
                    <tr>
                        <td style="background-color: ${opts.headerBg}; padding: 30px 20px 25px; text-align: center; border-bottom: 6px solid #000000;">
                            <!-- Logo -->
                            <div style="margin-bottom: 16px;">
                                ${getLogoImgTag(140)}
                            </div>
                            <!-- Title -->
                            <h1 style="margin: 0; font-size: 26px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: 2px; color: ${opts.titleColor}; text-shadow: 3px 3px 0px rgba(0,0,0,0.5); line-height: 1.2;">
                                ${opts.headerTitle}
                            </h1>
                            <!-- Subtitle Badge -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 12px auto 0;">
                                <tr>
                                    <td style="background-color: #000000; padding: 6px 16px; border: 2px solid ${opts.accentColor};">
                                        <span style="color: ${opts.accentColor}; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px;">
                                            ${opts.headerSubtitle}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- BODY CONTENT -->
                    <tr>
                        <td style="padding: 30px 24px; background-color: #111111;">
                            ${opts.bodyContent}
                        </td>
                    </tr>

                    <!-- WARNING TAPE BOTTOM -->
                    <tr><td style="${warningTapeStyle}"></td></tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="background-color: #000000; padding: 20px; text-align: center;">
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="padding-bottom: 8px; text-align: center;">
                                        ${getLogoImgTag(60)}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center;">
                                        <span style="color: #10B961; font-size: 10px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">
                                            IV EDICI&Oacute;N
                                        </span>
                                        <br />
                                        <a href="https://teobu.com" target="_blank" style="color: #888888; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; text-decoration: none;">
                                            POWERED BY <span style="color: #10B961;">TEOBU S.A</span>
                                        </a>
                                        <br />
                                        <span style="color: #555555; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                                            &copy; 2026 CATOBOTS &bull; UCACUE
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

// ============================================================
// EMAIL: Welcome / Registration Received
// ============================================================
export const sendWelcomeEmail = async (to: string, formData: any) => {
    console.log('\n=== sendWelcomeEmail called ===');
    console.log('To:', to);
    console.log('FormData:', JSON.stringify(formData, null, 2));
    
    const uniqueCategories: string[] = [];
    if (formData?.juniorCategory) uniqueCategories.push(formData.juniorCategory);
    if (formData?.seniorCategory) uniqueCategories.push(formData.seniorCategory);
    if (formData?.masterCategory) uniqueCategories.push(formData.masterCategory);
    if (formData?.category && typeof formData.category === 'string' && !['Junior', 'Senior', 'Master'].includes(formData.category)) {
        uniqueCategories.push(formData.category);
    }
    
    console.log('Categories detected:', uniqueCategories);

    // Build rules links
    const rulesUrls = await getRulesUrls();
    const ec = await getEventConfig();
    const rulesLinksHtml = uniqueCategories.map(cat => {
        const url = rulesUrls[cat];
        if (url) {
            return `
            <tr>
                <td style="padding: 4px 0;">
                    <a href="${url}" style="display: block; background-color: #000000; color: #FFF000; padding: 12px 16px; text-decoration: none; font-weight: 900; font-size: 13px; border: 3px solid #FFF000; text-transform: uppercase; letter-spacing: 1px; text-align: center; box-shadow: 3px 3px 0px #10B961;">
                        &#9889; REGLAS: ${cat.toUpperCase()}
                    </a>
                </td>
            </tr>`;
        }
        return '';
    }).join('');

    // Category info block
    const categoryDisplay = formData?.category ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
            <tr>
                <td style="background-color: #000000; border-left: 6px solid #FFF000; padding: 16px 20px;">
                    <span style="color: #666666; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 4px;">
                        DIVISI&Oacute;N ASIGNADA
                    </span>
                    <span style="color: #FFF000; font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">
                        ${formData.category} ${uniqueCategories.length ? '&bull; ' + uniqueCategories.join(', ') : ''}
                    </span>
                </td>
            </tr>
        </table>
    ` : '';

    const bodyContent = `
        <!-- Greeting -->
        <p style="font-size: 15px; line-height: 1.7; color: #FFFFFF; margin: 0 0 20px; font-weight: 700; text-transform: uppercase;">
            ATENCI&Oacute;N COMANDANTE,
        </p>
        <p style="font-size: 14px; line-height: 1.7; color: #CCCCCC; margin: 0 0 24px; font-weight: 500;">
            Hemos recibido tus datos de inscripci&oacute;n para la 
            <span style="color: #10B961; font-weight: 900;">IV EDICI&Oacute;N DE CATOBOTS</span>.
            Tu expediente est&aacute; en proceso de verificaci&oacute;n.
        </p>

        ${categoryDisplay}

        <!-- Status Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
                <td style="background-color: #FFF000; border: 4px solid #000000; padding: 20px; box-shadow: 4px 4px 0px #000000;">
                    <span style="display: block; font-size: 11px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; opacity: 0.6;">
                        ESTADO DE OPERACI&Oacute;N
                    </span>
                    <span style="display: block; font-size: 16px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 1px; line-height: 1.4;">
                        &#9203; VERIFICANDO FONDOS
                    </span>
                    <span style="display: block; font-size: 12px; font-weight: 600; color: #333333; margin-top: 10px; line-height: 1.5; text-transform: uppercase;">
                        Nuestros sistemas est&aacute;n revisando tu pago. Recibir&aacute;s otra alerta en cuanto el centro de mando apruebe o rechace tu solicitud.
                    </span>
                </td>
            </tr>
        </table>

        ${rulesLinksHtml ? `
        <!-- Rules Section -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
            <tr>
                <td style="background-color: #000000; border-left: 6px solid #10B961; padding: 20px;">
                    <span style="display: block; color: #FFFFFF; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                        NORMATIVA DE COMBATE
                    </span>
                    <span style="display: block; color: #888888; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
                        Accede a tus manuales oficiales antes de entrar a la arena
                    </span>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${rulesLinksHtml}
                    </table>
                </td>
            </tr>
        </table>
        ` : ''}
        <!-- Contact Info Footer -->
        ${ec.contactPhone || ec.contactEmail ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="background-color: #0a0a0a; padding: 20px; border-top: 3px solid #2d2d44; text-align: center;">
                    <span style="display: block; color: #10B961; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px;">
                        PARA MÁS INFORMACIÓN
                    </span>
                    ${ec.contactPhone ? `
                    <a href="tel:${ec.contactPhone}" style="display: inline-block; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; margin: 0 8px;">
                        📞 ${ec.contactPhone}
                    </a>
                    <a href="https://wa.me/${ec.contactPhone.replace(/\D/g, '').replace(/^0/, '593')}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; padding: 6px 14px; text-decoration: none; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 8px;">
                        💬 WhatsApp
                    </a>
                    ` : ''}
                    ${ec.contactEmail ? `
                    <a href="mailto:${ec.contactEmail}" style="display: inline-block; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; margin: 0 8px;">
                        ✉️ ${ec.contactEmail}
                    </a>
                    ` : ''}
                </td>
            </tr>
        </table>
        ` : ''}
    `;

    const htmlContent = buildEmailHtml({
        headerBg: '#10B961',
        headerTitle: 'TRANSMISI&Oacute;N RECIBIDA',
        headerSubtitle: 'SECUENCIA DE INSCRIPCI&Oacute;N ACTIVADA',
        titleColor: '#FFF000',
        bodyContent,
        accentColor: '#10B961',
    });

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
            subject: "⚡ INSCRIPCIÓN RECIBIDA — CatoBots IV",
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

// ============================================================
// EMAIL: Status Update (Approved / Rejected)
// ============================================================
export const sendStatusEmail = async (to: string, status: 'APPROVED' | 'REJECTED', formData?: any) => {
    const isApproved = status === 'APPROVED';
    const ec = await getEventConfig();
    const config = {
        headerBg: isApproved ? '#10B961' : '#DC2626',
        titleColor: '#FFF000',
        title: isApproved ? 'ACREDITACI&Oacute;N APROBADA' : 'SOLICITUD RECHAZADA',
        subtitle: isApproved ? 'UNIDAD LISTA PARA EL COMBATE' : 'ACCI&Oacute;N REQUERIDA',
        accentColor: isApproved ? '#10B961' : '#DC2626',
        statusBg: isApproved ? '#10B961' : '#DC2626',
        statusTextColor: isApproved ? '#000000' : '#FFFFFF',
        message: isApproved
            ? 'Tu pago ha sido verificado y tu unidad est&aacute; oficialmente registrada para el combate en la IV Edici&oacute;n de CatoBots.'
            : 'Tu pago no pudo ser verificado y tu inscripci&oacute;n ha sido rechazada. Comun&iacute;cate inmediatamente con el centro de mando para resolver esto.',
    };

    // Category display if available
    const subCat = formData?.juniorCategory || formData?.seniorCategory || formData?.masterCategory || '';
    const categoryBlock = formData?.category ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
            <tr>
                <td style="background-color: #000000; border-left: 6px solid ${config.accentColor}; padding: 16px 20px;">
                    <span style="color: #666666; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 4px;">
                        DIVISI&Oacute;N ASIGNADA
                    </span>
                    <span style="color: ${config.accentColor}; font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">
                        ${formData.category}${subCat ? ' &bull; ' + subCat : ''}
                    </span>
                </td>
            </tr>
        </table>
    ` : '';

    const bodyContent = `
        <!-- Greeting -->
        <p style="font-size: 15px; line-height: 1.7; color: #FFFFFF; margin: 0 0 20px; font-weight: 700; text-transform: uppercase;">
            ATENCI&Oacute;N COMANDANTE,
        </p>
        <p style="font-size: 14px; line-height: 1.7; color: #CCCCCC; margin: 0 0 24px; font-weight: 500;">
            Tenemos nueva informaci&oacute;n sobre tu expediente de inscripci&oacute;n para la
            <span style="color: #10B961; font-weight: 900;">IV EDICI&Oacute;N DE CATOBOTS</span>.
        </p>

        ${categoryBlock}

        <!-- Status Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
                <td style="background-color: ${config.statusBg}; border: 4px solid #000000; padding: 24px; box-shadow: 6px 6px 0px #000000; text-align: center;">
                    <span style="display: block; font-size: 22px; font-weight: 900; color: ${config.statusTextColor}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; line-height: 1.2;">
                        ${isApproved ? '&#10003;' : '&#10007;'} ${config.title}
                    </span>
                    <span style="display: block; font-size: 13px; font-weight: 700; color: ${config.statusTextColor}; text-transform: uppercase; line-height: 1.6; opacity: 0.9;">
                        ${config.message}
                    </span>
                </td>
            </tr>
        </table>

        ${isApproved ? `
        <!-- Event Info (only for approved) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
            <tr>
                <td style="background-color: #000000; padding: 20px; border-left: 6px solid #FFF000;">
                    <span style="display: block; color: #FFF000; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">
                        COORDENADAS DEL EVENTO
                    </span>
                    <span style="display: block; color: #FFFFFF; font-size: 13px; font-weight: 700; text-transform: uppercase; line-height: 1.8;">
                        &#9889; FECHA: ${ec.eventDate || '---'}<br />
                        &#9889; LUGAR: ${ec.eventVenue || '---'}
                    </span>
                </td>
            </tr>
        </table>

        <!-- Google Maps Link -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="background-color: #000000; border: 3px solid #10B961; overflow: hidden; text-align: center; padding: 10px;">
                    <a href="${ec.eventMapsUrl || '#'}" target="_blank" style="text-decoration: none; display: inline-block;">
                        <!-- Using a generic map placeholder since direct Google Static Maps require an API key and are often blocked in emails -->
                        <div style="background-color: #1a1a2e; border: 1px solid #2d2d44; padding: 20px; text-align: center;">
                           <span style="color: #10B961; font-size: 30px; display: block; margin-bottom: 10px;">🗺️</span>
                           <span style="color: #888888; font-size: 12px; font-weight: 700; text-transform: uppercase;">VER MAPA TÁCTICO EN GOOGLE MAPS</span>
                        </div>
                    </a>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding: 14px 16px; text-align: center;">
                                <a href="${ec.eventMapsUrl || '#'}" target="_blank" style="display: inline-block; background-color: #10B961; color: #000000; padding: 10px 24px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; border: 3px solid #000000; box-shadow: 3px 3px 0px #000000;">
                                    &#128205; ABRIR EN GOOGLE MAPS
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        ` : `
        <!-- Contact Info (only for rejected) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="background-color: #000000; padding: 20px; border-left: 6px solid #DC2626;">
                    <span style="display: block; color: #DC2626; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px;">
                        CENTRO DE MANDO
                    </span>
                    <span style="display: block; color: #CCCCCC; font-size: 12px; font-weight: 600; text-transform: uppercase; line-height: 1.8;">
                        Contacta al equipo organizador para resolver este inconveniente lo antes posible.
                    </span>
                </td>
            </tr>
        </table>
        `}
        <!-- Contact Info Footer -->
        ${ec.contactPhone || ec.contactEmail ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td style="background-color: #0a0a0a; padding: 20px; border-top: 3px solid #2d2d44; text-align: center;">
                    <span style="display: block; color: #10B961; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px;">
                        PARA MÁS INFORMACIÓN
                    </span>
                    ${ec.contactPhone ? `
                    <a href="tel:${ec.contactPhone}" style="display: inline-block; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; margin: 0 8px;">
                        📞 ${ec.contactPhone}
                    </a>
                    <a href="https://wa.me/${ec.contactPhone.replace(/\D/g, '').replace(/^0/, '593')}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; padding: 6px 14px; text-decoration: none; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 8px;">
                        💬 WhatsApp
                    </a>
                    ` : ''}
                    ${ec.contactEmail ? `
                    <a href="mailto:${ec.contactEmail}" style="display: inline-block; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; margin: 0 8px;">
                        ✉️ ${ec.contactEmail}
                    </a>
                    ` : ''}
                </td>
            </tr>
        </table>
        ` : ''}
    `;

    const htmlContent = buildEmailHtml({
        headerBg: config.headerBg,
        headerTitle: config.title,
        headerSubtitle: config.subtitle,
        titleColor: config.titleColor,
        bodyContent,
        accentColor: config.accentColor,
    });

    try {
        if (!process.env.RESEND_API_KEY) {
            console.log('No RESEND_API_KEY found, skipping status email to:', to);
            return;
        }

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to,
            subject: `${isApproved ? '✅' : '❌'} ${isApproved ? 'APROBADA' : 'RECHAZADA'} — CatoBots IV`,
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
