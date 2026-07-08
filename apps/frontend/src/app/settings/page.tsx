"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Mail, Trash2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { useHighlightSection } from "@/hooks/use-highlight-section";
import { Suspense, useEffect, useState } from "react";
import { api, DiscordFormState, EmailFormState, TypeChannelsAvailable } from "@/lib/api";
import { notify } from "@/components/notify";


export default function SettingsPage() {
    return (
        <Suspense fallback={null}>
            <SettingsPageContent />
        </Suspense>
    );
}

function SettingsPageContent() {
    useHighlightSection();
    const [smtp, setSmtp] = useState<EmailFormState>({
        type: "EMAIL",
        smtpHost: "",
        smtpPort: 0,
        smtpUsernameFrom: "",
        smtpPassword: "",
        recipientEmail: "",
        enabled: false,
    });
    const [discordWebhook, setDiscordWebhook] = useState<DiscordFormState>({
        type: "DISCORD",
        webhookUrl: "",
        enabled: false,
    });

    useEffect(() => {
        api.notifications.getChannels().then((channels) => {
            for (const ch of channels) {
                if (ch.type === "EMAIL") setSmtp({ id: ch.id, type: "EMAIL", ...ch.config });
                if (ch.type === "DISCORD") setDiscordWebhook({ id: ch.id, type: "DISCORD", ...ch.config });

            }
        });
    }, []);

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
                <CardHeader className="relative">
                    <DeleteNotificationChannel id={smtp?.id ?? ""} />
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
                                value={smtp?.smtpHost ?? ""}
                                onChange={(e) => setSmtp({ ...smtp, smtpHost: e.target.value })}
                                autoComplete="off" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="port">Port</Label>
                            <Input id="port" type="number" placeholder="587"
                                value={smtp?.smtpPort ?? ""}
                                onChange={(e) => setSmtp({ ...smtp, smtpPort: Number(e.target.value) })}
                                autoComplete="off" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="username">Username (From)</Label>
                        <Input id="username" type="text" placeholder="you@gmail.com"
                            value={smtp?.smtpUsernameFrom ?? ""}
                            onChange={(e) => setSmtp({ ...smtp, smtpUsernameFrom: e.target.value })}
                            autoComplete="off" />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="App password"
                            value={smtp?.smtpPassword ?? ""}
                            onChange={(e) => setSmtp({ ...smtp, smtpPassword: e.target.value })}
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
                            <TestNotificationButton id={smtp?.id ?? ""} />
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
                        <Switch id="enable-smtp" checked={smtp?.enabled ?? false}
                            onCheckedChange={(checked: boolean) => setSmtp({ ...smtp, enabled: checked })} />
                    </div>
                    <div className="flex justify-end">
                        <SaveButtonNottifications id={smtp?.id} type="EMAIL" value={smtp} onSave={(id) => setSmtp({ ...smtp, id })} />
                    </div>
                </CardContent>
            </Card>

            {/* Discord */}
            <Card id="discord" className="transition-shadow duration-300">
                <CardHeader className="relative">
                    <DeleteNotificationChannel id={discordWebhook?.id ?? ""} />
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
                            <TestNotificationButton id={discordWebhook?.id ?? ""} />
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
                        <Switch id="enable-discord" checked={discordWebhook?.enabled ?? false}
                            onCheckedChange={(checked: boolean) => setDiscordWebhook({ ...discordWebhook, enabled: checked })} />
                    </div>
                    <div className="flex justify-end">
                        <SaveButtonNottifications id={discordWebhook?.id} type="DISCORD" value={discordWebhook} onSave={(id) => setDiscordWebhook({ ...discordWebhook, id })} />
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}

// To use this compoenent, the notification channel need to have an id and enabled property.
function SaveButtonNottifications<T extends { enabled?: boolean }>({ id, type, value, onSave }:
    {
        id?: string,
        type: TypeChannelsAvailable,
        value: T,
        onSave?: (id: string) => void,
    }) {

    const channelLabels: Record<TypeChannelsAvailable, string> = {
        DISCORD: "Discord",
        EMAIL: "Email",
    };

    const handleCreateOrUpdateNotificationChannels = async (
        id: string | undefined,
        type: TypeChannelsAvailable,
        channels: T
    ) => {
        const errorMsg = `Failed to save ${channelLabels[type]} notification channels. Please try again.`;

        try {
            if (id) {
                await notify.promise(api.notifications.updateChannels({ id, channels }), {
                    loading: "Saving changes...",
                    success: `${channelLabels[type]} notification channels updated successfully.`,
                    error: errorMsg,
                });
            } else {
                const created = await notify.promise(api.notifications.createChannels({ type, channels }), {
                    loading: "Saving changes...",
                    success: `${channelLabels[type]} notification channels saved successfully.`,
                    error: errorMsg,
                    description: "You can now receive notifications",
                });
                if (created) onSave?.(created.id);
            }
        } catch {
            // notify.promise has already displayed the error toast; we simply swallow the rejection.
        }
    };

    return (
        <Button onClick={() => {
            handleCreateOrUpdateNotificationChannels(id, type, value);
        }}>Save changes</Button>
    );
}

function DeleteNotificationChannel({ id }: {
    id: string,
}) {

    return (
        <Trash2
            size={18}
            className="absolute top-0 right-5 text-muted-foreground hover:text-destructive cursor-pointer"
            onClick={() => {
                notify.promise(api.notifications.deleteChannels({ id }), {
                    loading: "Deleting notification channel...",
                    success: "Notification channel deleted successfully.",
                    error: "Failed to delete notification channel. Please try again.",
                    description: "You will no longer receive notifications from this channel.",
                })
            }} />
    );
}

function TestNotificationButton({ id }: {
    id: string,
}) {
    return (
        <Button variant="outline" onClick={() => {
            notify.promise(api.notifications.testNotification({ id }), {
                loading: "Sending test notification...",
                success: "Test notification sent successfully.",
                error: "Failed to send test notification. Please check your settings.",
                description: "Check your email or Discord channel for the test notification.",
            })
        }}>Send test</Button>
    );
}