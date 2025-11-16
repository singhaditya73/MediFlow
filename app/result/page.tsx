"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Copy, Download, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"

// Sample FHIR JSON data for demonstration
const sampleFhirJson = {
    "resourceType": "Patient",
    "id": "p12345",
    "meta": {
      "versionId": "2",
      "lastUpdated": "2025-04-26T14:30:00Z"
    },
    "text": {
      "status": "generated",
      "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">John Samuel Smith, born December 25, 1974</div>"
    },
    "identifier": [
      {
        "use": "official",
        "type": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
              "code": "MR",
              "display": "Medical Record Number"
            }
          ],
          "text": "Medical Record Number"
        },
        "system": "http://hospital.example.org",
        "value": "12345"
      },
      {
        "use": "secondary",
        "type": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
              "code": "SS",
              "display": "Social Security Number"
            }
          ],
          "text": "Social Security Number"
        },
        "system": "http://example.com/social-security",
        "value": "987-65-4321"
      }
    ],
    "active": true,
    "name": [
      {
        "use": "official",
        "family": "Smith",
        "given": [
          "John",
          "Samuel"
        ],
        "prefix": [
          "Mr."
        ]
      },
      {
        "use": "nickname",
        "given": [
          "Johnny"
        ]
      }
    ],
    "telecom": [
      {
        "system": "phone",
        "value": "555-123-4567",
        "use": "home"
      },
      {
        "system": "phone",
        "value": "555-765-4321",
        "use": "work"
      },
      {
        "system": "email",
        "value": "john.smith@example.com",
        "use": "work"
      },
      {
        "system": "email",
        "value": "johnny.smith@home.com",
        "use": "home"
      }
    ],
    "gender": "male",
    "birthDate": "1974-12-25",
    "deceasedBoolean": false,
    "address": [
      {
        "use": "home",
        "type": "physical",
        "line": [
          "123 Main St"
        ],
        "city": "Anytown",
        "state": "CA",
        "postalCode": "12345",
        "country": "USA"
      },
      {
        "use": "temporary",
        "type": "physical",
        "line": [
          "456 Elm St"
        ],
        "city": "Othertown",
        "state": "CA",
        "postalCode": "67890",
        "country": "USA"
      }
    ],
    "maritalStatus": {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
          "code": "M",
          "display": "Married"
        }
      ],
      "text": "Married"
    },
    "multipleBirthBoolean": false,
    "photo": [
      {
        "contentType": "image/jpeg",
        "url": "http://example.com/patient-photos/john_smith.jpg"
      }
    ],
    "communication": [
      {
        "language": {
          "coding": [
            {
              "system": "urn:ietf:bcp:47",
              "code": "en",
              "display": "English"
            }
          ],
          "text": "English"
        },
        "preferred": true
      }
    ],
    "contact": [
      {
        "relationship": [
          {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
                "code": "N",
                "display": "Emergency Contact"
              }
            ],
            "text": "Spouse"
          }
        ],
        "name": {
          "family": "Smith",
          "given": ["Jane"]
        },
        "telecom": [
          {
            "system": "phone",
            "value": "555-987-6543",
            "use": "home"
          }
        ],
        "address": {
          "line": [
            "123 Main St"
          ],
          "city": "Anytown",
          "state": "CA",
          "postalCode": "12345",
          "country": "USA"
        }
      }
    ],
    "generalPractitioner": [
      {
        "reference": "Practitioner/1",
        "display": "Dr. Alice Williams"
      }
    ],
    "managingOrganization": {
      "reference": "Organization/1",
      "display": "Anytown Medical Center"
    }
  }
  

export default function ResultsPage() {
  const [copied, setCopied] = useState(false)
  const jsonString = JSON.stringify(sampleFhirJson, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "patient-fhir.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/20 dark:from-background dark:to-blue-950/10">
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-5"></div>
      <div className="container px-4 py-6 mx-auto relative z-10">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">MediFlow</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="outline" className="hidden md:flex">
              Sign In
            </Button>
          </div>
        </header>

        <main className="py-12 max-w-4xl mx-auto">
          <Link href="/upload" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Conversion Results</h1>
              <p className="text-muted-foreground">
                Your clinical data has been successfully converted to FHIR format.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy} className="flex items-center gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-foreground">FHIR Resource</CardTitle>
              <CardDescription className="text-muted-foreground">Patient resource in FHIR R4 format</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="json" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="json">JSON</TabsTrigger>
                  <TabsTrigger value="xml">XML</TabsTrigger>
                  <TabsTrigger value="turtle">Turtle</TabsTrigger>
                </TabsList>

                <TabsContent value="json" className="mt-0">
                  <div className="relative">
                    <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-6 rounded-xl overflow-auto max-h-[500px] text-sm">
                      <code>{jsonString}</code>
                    </pre>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white h-8 w-8"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="xml" className="mt-0">
                  <div className="bg-gray-100 dark:bg-gray-800 text-muted-foreground p-6 rounded-xl flex items-center justify-center h-[300px]">
                    <p>XML view is not available in this preview</p>
                  </div>
                </TabsContent>

                <TabsContent value="turtle" className="mt-0">
                  <div className="bg-gray-100 dark:bg-gray-800 text-muted-foreground p-6 rounded-xl flex items-center justify-center h-[300px]">
                    <p>Turtle view is not available in this preview</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100/80 dark:border-blue-800/30">
                <h3 className="font-medium text-foreground mb-2">Validation Results</h3>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  <span>This FHIR resource is valid according to FHIR R4 specification</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/signup">Convert Another File</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0"
            >
              <Link href="/signup">Manage Access Control</Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
