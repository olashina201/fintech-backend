const message = {
    from: "norreply@gmail.com",
    to: request.body.email,
    subject: "SOQ - verify your email",
    text: `
        hello,thanks for registering on our site.
        please copy and paste the link below to verify your account.
        http://${request.headers.host}/verify-email?token${user.emailToken}
        `,
    html: `
        <h1>Hello,<h1>
        <p>Thanks for registering on our site</p>
        <p>please click te link below to verify your account. </p>
        <a href="http://${request.headers.host}/verify-email?token${user.emailToken}">verify your account </a>
        `
}