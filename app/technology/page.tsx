"use client"
import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Database, FileText, Lock, Network, Shield, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function TechnologyPage() {
  const sectionRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -10% 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in")
        }
      })
    }, observerOptions)

    sectionRefs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    return () => {
      sectionRefs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10">
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-5"></div>
      <div className="container px-4 py-4 mx-auto relative z-10">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">MediFlow</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link href="/signup">Sign In</Link>
            </Button>
          </div>
        </header>

        <main className="py-8 max-w-4xl mx-auto">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Technology</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              At MediFlow, we combine innovative technologies to streamline the process of clinical data standardization
              and ensure secure, efficient interoperability across healthcare systems.
            </p>
          </div>

          <div className="space-y-16">
            <div ref={sectionRefs[0]} className="opacity-0 translate-y-4 transition-all duration-700 ease-out">
              <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-blue-500"></div>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">
                        FHIR (Fast Healthcare Interoperability Resources)
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        The gold standard for healthcare data exchange
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    FHIR is the gold standard for healthcare data exchange, designed to enable seamless interoperability
                    between diverse healthcare systems. MediFlow leverages FHIR to convert unstructured clinical data
                    into standardized resources, ensuring better communication and data consistency across various
                    health providers. This allows for more accurate and efficient patient care by integrating data from
                    different sources into one cohesive format.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div ref={sectionRefs[1]} className="opacity-0 translate-y-4 transition-all duration-700 ease-out">
              <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Network className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Web3 and Blockchain Technologies</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Decentralized systems for patient control
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We integrate Web3 technologies to give patients full control over their health data. By utilizing
                    decentralized systems, we ensure that health data is secure, transparent, and immutable. Blockchain
                    provides an immutable audit trail for all data access and modifications, which enhances trust and
                    security in healthcare transactions. Web3 also enables decentralized identity management, allowing
                    patients to securely share their health data with providers as needed, without relinquishing
                    control.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div ref={sectionRefs[2]} className="opacity-0 translate-y-4 transition-all duration-700 ease-out">
              <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Decentralized Storage with IPFS</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Distributed data storage for resilience
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    MediFlow uses IPFS (InterPlanetary File System) for decentralized data storage, ensuring that
                    medical data is distributed across multiple nodes. This approach guarantees data availability and
                    resilience, minimizing the risk of data loss or unauthorized access. IPFS complements the
                    decentralization ethos of Web3 and ensures that patient data is both secure and accessible only by
                    authorized entities.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div ref={sectionRefs[3]} className="opacity-0 translate-y-4 transition-all duration-700 ease-out">
              <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Advanced Data Encryption and Privacy</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        State-of-the-art protection for sensitive information
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To protect sensitive health information, we implement state-of-the-art encryption techniques both in
                    transit and at rest. This ensures that patient data remains confidential and secure, in compliance
                    with global data protection regulations (like HIPAA). The integration of blockchain further
                    guarantees transparency and immutability, adding an extra layer of trust to the data-sharing
                    process.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div ref={sectionRefs[4]} className="opacity-0 translate-y-4 transition-all duration-700 ease-out">
              <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">Smart Contracts for Access Control</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Automated and secure permission management
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    With smart contracts, MediFlow enables automated and secure access control. Patients can grant or
                    revoke access to their medical data with a simple interface, ensuring that only authorized
                    healthcare providers have access to the information they need. These contracts are executed on the
                    blockchain, ensuring they are tamper-proof and transparent.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button
              asChild
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0"
            >
              <Link href="/signup">Get Started with MediFlow</Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
