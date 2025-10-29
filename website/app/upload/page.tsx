"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Upload, X, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState("")

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
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
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Clinical Data</h1>
          <p className="text-muted-foreground mb-8">
            Upload your clinical data files or paste text directly to convert to FHIR format.
          </p>

          <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-foreground">Data Input</CardTitle>
              <CardDescription className="text-muted-foreground">
                Choose how you want to provide your clinical data for conversion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="file">File Upload</TabsTrigger>
                  <TabsTrigger value="text">Text Input</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="mt-0">
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer ${
                      isDragging
                        ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/20"
                        : "border-border hover:border-teal-300 dark:hover:border-teal-700"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    {!uploadedFile ? (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Drag & Drop Your File Here or Click to Browse
                        </h3>
                        <p className="text-muted-foreground mb-4 max-w-md">
                          Support for HL7, CSV, XML, JSON and other clinical data formats
                        </p>
                        <div className="relative">
                          <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0">
                            Select File
                          </Button>
                          <label htmlFor="file-upload" className="sr-only">Upload file</label>
                          <input
                            id="file-upload"
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            title="Upload clinical data file"
                            aria-label="Upload clinical data file"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-card/80 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={removeFile}
                          className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="text" className="mt-0">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Paste your clinical data here..."
                      className="min-h-[200px] p-4 border border-border rounded-xl focus:border-teal-300 dark:focus:border-teal-700 focus:ring focus:ring-teal-100/50 dark:focus:ring-teal-900/50 bg-card/50"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                    <div className="text-sm text-muted-foreground">
                      <p>Supported formats: HL7 v2, FHIR JSON/XML, CSV, and other clinical data formats.</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 flex justify-end">
                <Button
                  asChild
                  className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0"
                >
                  <Link href="/result">Convert to FHIR</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-12 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/80 dark:border-blue-800/30 rounded-xl p-6">
            <h3 className="text-lg font-medium text-foreground mb-2">About Data Privacy</h3>
            <p className="text-muted-foreground mb-4">
              Your data is processed securely using Web3 technology. All processing happens in your browser for maximum
              privacy and security, with blockchain-based audit trails for transparency.
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Link href="#" className="hover:underline">
                Learn more about our privacy practices
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
