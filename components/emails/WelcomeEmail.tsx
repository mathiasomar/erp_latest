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

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export default function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />

      <Preview>Welcome to O-ERP</Preview>

      <Body
        style={{
          backgroundColor: "#f6f9fc",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "40px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "40px",
            margin: "0 auto",
            maxWidth: "600px",
          }}
        >
          <Heading>Welcome to O-ERP, {name}!</Heading>

          <Text>Your account has been successfully created.</Text>

          <Text>You can now sign in and start using your account.</Text>

          <Section style={{ textAlign: "center" }}>
            <Button
              href={loginUrl}
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: "12px 20px",
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              Sign in
            </Button>
          </Section>

          <Text>
            If you did not create this account, you can safely ignore this
            email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
