import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

export async function handler(request, context) {
    try {
        const url = new URL(request.url);
        const caseId = url.searchParams.get("caseId");

        if (!caseId) {
            return new Response(JSON.stringify({
                success: false,
                error: "caseId missing"
            }), { status: 400 });
        }

        const account = process.env.STORAGE_ACCOUNT_NAME;
        const key = process.env.STORAGE_ACCOUNT_KEY;

        const tableUrl = `https://${account}.table.core.windows.net`;
        const credential = new AzureNamedKeyCredential(account, key);

        const tableClient = new TableClient(tableUrl, "Messages", credential);

        const messages = [];
        const entities = tableClient.listEntities({ queryOptions: { filter: `PartitionKey eq '${caseId}'` } });

        for await (const entity of entities) {
            messages.push(entity);
        }

        // Sort by timestamp
        messages.sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1));

        return new Response(JSON.stringify({
            success: true,
            messages
        }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), { status: 500 });
    }
}
