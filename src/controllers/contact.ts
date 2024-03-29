import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import amqplib from "amqplib";

const transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
    }
});

/**
 * GET /contact
 * Contact form page.
 */
export const getContact = (req: Request, res: Response) => {
    res.render("contact", {
        title: "Contact"
    });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
export const postContact = async (req: Request, res: Response) => {
    check("name", "Name cannot be blank").not().isEmpty();
    check("email", "Email is not valid").isEmail();
    check("message", "Message cannot be blank").not().isEmpty();

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array());
        return res.redirect("/contact");
    }

    const mailOptions = {
        to: "your@email.com",
        from: `${req.body.name} <${req.body.email}>`,
        subject: "Contact Form",
        text: req.body.message
    };
    const connection: amqplib.Connection = global.connection;

    const channel = await connection.createChannel();

    await channel.sendToQueue("contacts", Buffer.from(JSON.stringify(mailOptions)));

    req.flash("success", { msg: "Email has been sent successfully!" });
    res.redirect("/contact");
    
    // transporter.sendMail(mailOptions, (err) => {
    //     if (err) {
    //         req.flash("errors", { msg: err.message });
    //         return res.redirect("/contact");
    //     }
    //     req.flash("success", { msg: "Email has been sent successfully!" });
    //     res.redirect("/contact");
    // });
};
