"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";
import { Icon } from "@iconify/react";
import { useHighlightSection } from "@/hooks/use-highlight-section";
import { useState } from "react";
import { DiscordWebhookSettingsResponse, SMTPSettingsResponse } from "@/lib/api";


export default function SettingsPage() {
    useHighlightSection();
    const [smtp, setSmtp] = useState<SMTPSettingsResponse>(null as any);
    const [discordWebhook, setDiscordWebhook] = useState<DiscordWebhookSettingsResponse>(null as any);

    return (
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your notification channels and monitoring preferences.
                </p>
            </div>

            <Separator />

            {/* SMTP */}
            <Card id="email" className="transition-shadow duration-300">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mail size={18} />
                        <CardTitle className="text-base">SMTP Settings</CardTitle>
                    </div>
                    <CardDescription>
                        Sends email alerts when a service goes down or comes back up.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="smtp-host">SMTP Host</Label>
                            <Input id="smtp-host" placeholder="smtp.gmail.com"
                                value={smtp?.SMTPHost ?? ""}
                                onChange={(e) => setSmtp({ ...smtp, SMTPHost: e.target.value })}
                                autoComplete="off" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="port">Port</Label>
                            <Input id="port" type="number" placeholder="587"
                                value={smtp?.SMTPPort ?? ""}
                                onChange={(e) => setSmtp({ ...smtp, SMTPPort: Number(e.target.value) })}
                                autoComplete="off" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="username">Username (From)</Label>
                        <Input id="username" type="text" placeholder="you@gmail.com"
                            value={smtp?.SMTPUsernameFrom ?? ""}
                            onChange={(e) => setSmtp({ ...smtp, SMTPUsernameFrom: e.target.value })}
                            autoComplete="off" />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="App password"
                            value={smtp?.SMTPPassword ?? ""}
                            onChange={(e) => setSmtp({ ...smtp, SMTPPassword: e.target.value })}
                            autoComplete="off" />
                        <p className="text-xs text-muted-foreground">
                            Gmail requires an App Password, not your regular password.
                        </p>
                    </div>

                    <Separator />

                    <div className="space-y-1.5">
                        <Label htmlFor="recipient">Recipient's Email</Label>
                        <div className="flex gap-2">
                            <Input id="recipient" type="email" placeholder="alerts@domain.com"
                                value={smtp?.recipientEmail ?? ""}
                                onChange={(e) => setSmtp({ ...smtp, recipientEmail: e.target.value })}
                                autoComplete="off" />
                            <Button variant="outline">Send test</Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="enable-smtp" >Enable SMTP</Label>
                            <p className="text-xs text-muted-foreground">
                                Send an email on every status change.
                            </p>
                        </div>
                        <Switch id="enable-smtp" checked={smtp?.enabled}
                            onCheckedChange={(checked: boolean) => setSmtp({ ...smtp, enabled: checked })} />
                    </div>
                    <div className="flex justify-end">
                        <Button>Save changes</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Discord */}
            <Card id="discord" className="transition-shadow duration-300">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:discord" height="18" />
                        <CardTitle className="text-base">Discord Webhook</CardTitle>
                    </div>
                    <CardDescription>
                        Sends notifications to a Discord channel when a service goes down or comes back up.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="discord-webhook">Webhook URL</Label>
                        <div className="flex gap-2">
                            <Input id="discord-webhook" placeholder="https://discord.com/api/webhooks/..."
                                value={discordWebhook?.webhookUrl ?? ""}
                                onChange={(e) => setDiscordWebhook({ ...discordWebhook, webhookUrl: e.target.value })}
                                autoComplete="off" />
                            <Button variant="outline">Send test</Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="enable-discord">Enable Discord</Label>
                            <p className="text-xs text-muted-foreground">
                                Post a message in your channel on every incident.
                            </p>
                        </div>
                        <Switch id="enable-discord" checked={discordWebhook?.enabled}
                            onCheckedChange={(checked: boolean) => setDiscordWebhook({ ...discordWebhook, enabled: checked })} />
                    </div>
                    <div className="flex justify-end">
                        <Button>Save changes</Button>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}


