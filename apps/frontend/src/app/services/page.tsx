import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TableCell } from "@/components/ui/table";

export default function ServicesPage() {
    return (
        <div className="m-10">
            {/* Add new service monitoring */}
            <div className="mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Ajouter un service à monitorer</CardTitle>
                        <CardDescription>Configurez un nouveau service pour le monitoring</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Form to add new service will go here */}
                        <p className="text-muted-foreground">Formulaire d'ajout de service (à implémenter)</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Services</CardTitle>
                    <CardDescription>Liste de tous les services monitorés</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* List of monitored services will go here */}
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left">Nom du service</th>
                                <th className="text-left">Statut</th>
                                <th className="text-left">Dernier check</th>
                                <th className="text-left">Latence</th>
                                <th className="text-left">Code de statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Example row */}
                            <tr>
                                <td>API de paiement</td>
                                <td className="text-green-500">Up</td>
                                <td>2024-06-01 12:00:00</td>
                                <TableCell className="text-muted-foreground">
                                    {/* Latency value */}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {/* Status code value */}
                                </TableCell>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}