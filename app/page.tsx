import Link from "next/link";
import {
  ArrowRight,
  Database,
  FileText,
  Lock,
  Shield,
  Upload,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10">
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-5"></div>
      <div className="container px-4 py-6 mx-auto relative z-10">
        <main className="py-12">
          <section className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-1.5 bg-gradient-to-r from-teal-500/10 to-blue-500/10 dark:from-teal-500/20 dark:to-blue-500/20 rounded-full text-sm font-medium text-teal-600 dark:text-teal-400 border border-teal-500/20 dark:border-teal-400/20">
              Transforming Healthcare Data Management
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
              Clinical Data{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                Standardization
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform unstructured clinical data into standardized FHIR format
              with Web3 technology for enhanced security and patient control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0"
              >
                <Link href="/signup">
                  Connect Wallet
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </section>
          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 dark:from-teal-500/10 dark:to-blue-500/10 rounded-3xl transform -skew-y-1"></div>
            <div className="relative bg-card/50 backdrop-blur-sm border border-border rounded-3xl shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
              <Image
                src="/images/pexels-pixabay-40568 (1).jpg"
                alt="MediFlow Dashboard"
                width={700}
                height={350}
                className="w-full h-64 object-cover rounded-b-3xl"
              />
            </div>
          </div>

          <section className="grid md:grid-cols-3 gap-8 mt-24">
            <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-300 transform origin-left transition-transform group-hover:scale-x-100 scale-x-0"></div>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  Easy Data Upload
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Drag & drop your files or paste your data directly into the
                  converter.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Link
                  href="/signup"
                  className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium flex items-center"
                >
                  Connect Wallet to Upload <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300 transform origin-left transition-transform group-hover:scale-x-100 scale-x-0"></div>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  FHIR Conversion
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Instantly convert your clinical data to standardized FHIR JSON
                  format.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Link
                  href="/signup"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center"
                >
                  Connect Wallet to View <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-300 transform origin-left transition-transform group-hover:scale-x-100 scale-x-0"></div>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl text-foreground">
                  Secure Access Control
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage who can access your converted healthcare data with
                  ease.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Link
                  href="/signup"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center"
                >
                  Connect Wallet to Manage <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
          </section>

          <section className="mt-24 max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                About MediFlow
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-blue-500 mx-auto mb-6"></div>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                MediFlow is transforming healthcare data management by
                standardizing unstructured clinical data into FHIR format. By
                integrating Web3 technologies, we offer decentralized identity
                management, enhanced data privacy, and immutable audit trails.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl shadow-lg overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
                <Image
                  src="/images/WhatsApp Image 2025-04-27 at 6.05.03 PM.jpeg"
                  alt="MediFlow Platform"
                  width={700}
                  height={350}
                  className="w-full h-auto"
                />
              </div>
              <div className="space-y-6">
                <p className="text-muted-foreground">
                  Our platform empowers patients to control their health data
                  while ensuring secure, interoperable data exchange among
                  healthcare providers. Trust, transparency, and security are at
                  the core of MediFlow, enabling a seamless healthcare
                  experience for all.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mt-1">
                      <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Decentralized Identity
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Web3 technology enables secure, patient-controlled
                        digital identities for healthcare access.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-1">
                      <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Immutable Audit Trails
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Blockchain-based audit logs ensure transparent,
                        tamper-proof records of all data access.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-1">
                      <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Enhanced Data Privacy
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Advanced encryption and granular access controls protect
                        sensitive health information.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  asChild
                  className="mt-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0"
                >
                  <Link href="/technology">Learn About Our Technology</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="mt-24 max-w-5xl mx-auto bg-gradient-to-r from-teal-50/50 to-blue-50/50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-border shadow-lg">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Why Choose MediFlow?
                </h2>
                <p className="text-muted-foreground">
                  Our platform combines the latest in FHIR standards with
                  cutting-edge Web3 technology to create a secure,
                  patient-centric healthcare data ecosystem.
                </p>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center mt-0.5 text-white font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        FHIR R4 Compliance
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Fully compliant with the latest FHIR R4 standards for
                        maximum interoperability.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center mt-0.5 text-white font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        HIPAA Compliance
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Secure, HIPAA-compliant processing with end-to-end
                        encryption.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center mt-0.5 text-white font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Web3 Integration
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Blockchain technology ensures data integrity and
                        transparent access logs.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="w-80 h-80 bg-card rounded-2xl shadow-xl border border-border flex items-center justify-center p-6 relative">
                  <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-5 rounded-2xl"></div>
                  <Image
                    src="/images/WhatsApp Image 2025-04-27 at 6.05.03 PM (1).jpeg"
                    alt="FHIR Conversion Illustration"
                    width={700}
                    height={350}
                    className="w-full h-auto relative z-10"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-24 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Healthcare Data?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join healthcare organizations worldwide who trust MediFlow for
              secure, standardized clinical data management.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0"
            >
              <Link href="/signup">
                Connect Wallet to Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>
        </main>

        <footer className="mt-8 py-8 border-t border-border">
          <div className=" max-w-5xl mx-auto">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">
                  MediFlow
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transforming healthcare data management with Web3 technology and
                FHIR standardization.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="GitHub"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 MediFlow. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
