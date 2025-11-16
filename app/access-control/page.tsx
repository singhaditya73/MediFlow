"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Info, Lock, Plus, Shield, User, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Sample access control data
const initialAccessList = [
 
]

export default function AccessControlPage() {
  const [accessList, setAccessList] = useState(initialAccessList)
  const [newEmail, setNewEmail] = useState("")

  const toggleAccess = (id: number) => {
    setAccessList(accessList.map((item) => (item.id === id ? { ...item, access: !item.access } : item)))
  }

  const addNewAccess = () => {
    if (!newEmail) return

    const newId = Math.max(...accessList.map((item) => item.id)) + 1
    setAccessList([
      ...accessList,
      { id: newId, name: `New User (${newEmail})`, email: newEmail, role: "Pending", access: true },
    ])
    setNewEmail("")
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
          <Link href="/results" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">Access Control</h1>
          <p className="text-muted-foreground mb-8">
            Manage who can access your converted healthcare data with Web3-powered decentralized identity management.
          </p>

          <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-foreground">Data Access Permissions</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Control who can view and use your converted FHIR data with blockchain-verified access.
                  </CardDescription>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400/20 to-purple-600/20 dark:from-purple-400/10 dark:to-purple-600/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/80 dark:border-blue-800/30 rounded-lg p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Web3-Powered Access Control</h3>
                    <p className="text-sm text-muted-foreground">
                      You control who can see your health information with blockchain-verified permissions. Toggle
                      access on or off for each healthcare provider.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email address to grant access"
                      className="flex-1 bg-card/50"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <Button
                      onClick={addNewAccess}
                      className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border">
                      <div className="col-span-5 font-medium text-foreground">Name</div>
                      <div className="col-span-4 font-medium text-foreground">Role</div>
                      <div className="col-span-3 font-medium text-foreground text-right">Access</div>
                    </div>

                    <div className="divide-y divide-border">
                      {accessList.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                          <div className="col-span-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                <User className="w-4 h-4 text-foreground" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{item.name}</div>
                                <div className="text-xs text-muted-foreground">{item.email}</div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-4 text-muted-foreground">{item.role}</div>
                          <div className="col-span-3 flex justify-end">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`access-${item.id}`} className="sr-only">
                                      Toggle access for {item.name}
                                    </Label>
                                    <Switch
                                      id={`access-${item.id}`}
                                      checked={item.access}
                                      onCheckedChange={() => toggleAccess(item.id)}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{item.access ? "Revoke Access" : "Grant Access"}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border border-border shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-foreground">Web3 Security Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Configure additional blockchain-based security options for your health data.
                  </CardDescription>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400/20 to-teal-600/20 dark:from-teal-400/10 dark:to-teal-600/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="audit-trail" className="text-base">
                      Blockchain Audit Trail
                    </Label>
                    <p className="text-sm text-muted-foreground">Keep an immutable record of who accessed your data</p>
                  </div>
                  <Switch id="audit-trail" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="access-notifications" className="text-base">
                      Access Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Get notified when someone views your data</p>
                  </div>
                  <Switch id="access-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="time-limited" className="text-base">
                      Smart Contract Time-Limited Access
                    </Label>
                    <p className="text-sm text-muted-foreground">Automatically expire access after 30 days</p>
                  </div>
                  <Switch id="time-limited" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-encryption" className="text-base">
                      Enhanced Web3 Encryption
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use additional blockchain-based encryption for sensitive data
                    </p>
                  </div>
                  <Switch id="data-encryption" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex justify-end">
            <Button
              asChild
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white border-0"
            >
              <Link href="/signup">Save Settings</Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  )
}
