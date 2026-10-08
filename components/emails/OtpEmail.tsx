import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OtpEmailProps {
  otp: string;
  verificationUrl?: string;
}

export default function OtpEmail({ otp, verificationUrl }: OtpEmailProps) {
  return (
    <Html>
      <Head />

      <Preview>Your O-ERP verification code</Preview>

      <Body
        style={{
          margin: 0,
          padding: "40px 0",
          backgroundColor: "#f4f7fb",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <Section
            style={{
              backgroundColor: "#0f172a",
              padding: "28px 32px",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Secure verification
            </Text>
          </Section>

          <Section style={{ padding: "40px 32px 24px" }}>
            <Heading
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "32px",
                lineHeight: "38px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Verify your email
            </Heading>

            <Text
              style={{
                margin: "18px 0 0",
                color: "#475569",
                fontSize: "16px",
                lineHeight: "24px",
                textAlign: "center",
              }}
            >
              Use the code below to complete your verification and secure your
              account.
            </Text>
          </Section>

          <Section style={{ padding: "0 32px" }}>
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "24px 16px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                }}
              >
                Your code
              </Text>

              <Text
                style={{
                  margin: "16px 0 0",
                  color: "#0f172a",
                  fontSize: "38px",
                  lineHeight: "42px",
                  fontWeight: 700,
                  letterSpacing: "8px",
                  textAlign: "center",
                  fontFamily: "monospace",
                }}
              >
                {otp}
              </Text>
            </div>
          </Section>

          {verificationUrl ? (
            <Section style={{ padding: "24px 32px 8px", textAlign: "center" }}>
              <Button
                href={verificationUrl}
                style={{
                  backgroundColor: "#2563eb",
                  borderRadius: "10px",
                  color: "#ffffff",
                  display: "inline-block",
                  fontSize: "15px",
                  fontWeight: 700,
                  lineHeight: "22px",
                  padding: "14px 26px",
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                Verify my account
              </Button>
            </Section>
          ) : null}

          <Section style={{ padding: "16px 32px 32px" }}>
            <Text
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "22px",
                textAlign: "center",
              }}
            >
              This code expires in 10 minutes. If you did not request this
              verification, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
