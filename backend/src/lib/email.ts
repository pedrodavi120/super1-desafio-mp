import nodemailer from 'nodemailer';

// Usaremos um transportador que imprime o e-mail no console.
// Isto é perfeito para desenvolvimento, pois não requer um servidor de e-mail real.
const transporter = nodemailer.createTransport({
	streamTransport: true,
	newline: 'unix',
	buffer: true,
});

transporter.verify().then(() => console.log('📧 Módulo de e-mail pronto para enviar (simulação no console).')).catch(console.error);

// Função genérica para "enviar" um e-mail
async function enviarEmail(destinatario: string, assunto: string, texto: string, html: string) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Marketplace" <no-reply@marketplace.com>',
            to: destinatario,
            subject: assunto,
            text: texto,
            html: html,
        });

        // Imprime o conteúdo do e-mail no log do backend
        console.log(`\n--- NOVO E-MAIL (SIMULAÇÃO) ---`);
        console.log(`Para: ${destinatario}`);
        console.log(`Assunto: ${assunto}`);
        const emailContent = (info.message as Buffer).toString();
        console.log(emailContent.substring(emailContent.indexOf('Content-Type')));
        console.log(`--- FIM DO E-MAIL ---\n`);

    } catch (error) {
        console.error(`Falha ao enviar e-mail para ${destinatario}:`, error);
    }
}


export async function enviarEmailConfirmacao(destinatario: string, dados: any) {
    await enviarEmail(
        destinatario,
        'Seu agendamento foi confirmado!',
        `Olá! Seu serviço "${dados.servicoNome}" com ${dados.prestadorNome} foi agendado para ${dados.data}.`,
        `<p>Olá!</p><p>Seu serviço <strong>"${dados.servicoNome}"</strong> com <strong>${dados.prestadorNome}</strong> foi agendado para <strong>${dados.data}</strong>.</p>`
    );
}

export async function enviarEmailNotificacao(destinatario: string, dados: any) {
	await enviarEmail(
        destinatario,
        'Você tem um novo agendamento!',
        `Olá ${dados.prestadorNome}! O cliente ${dados.clienteNome} agendou o serviço "${dados.servicoNome}" para ${dados.data}.`,
        `<p>Olá ${dados.prestadorNome}!</p><p>O cliente <strong>${dados.clienteNome}</strong> agendou o serviço <strong>"${dados.servicoNome}"</strong> para <strong>${dados.data}</strong>.</p>`
    );
}

