import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

export async function handler(request, context) {
    try {
        const body = await request.json();
        const { caseId, sender, message } = body;

        if (!caseId || !message) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Missing caseId or message"
                }),
                { status: 400 }
            );
        }

        // Storage credentials
        const account = process.env.STORAGE_ACCOUNT_NAME;
        const key = process.env.STORAGE_ACCOUNT_KEY;

        const tableUrl = `https://${account}.table.core.windows.net`;
        const credential = new AzureNamedKeyCredential(account, key);

        const tableClient = new TableClient(tableUrl, "Messages", credential);

        // Unique RowKey for message
        const rowKey =
            Date.now().toString() +
            Math.random().toString(36).substring(2, 6).toUpperCase();

        const entity = {
            partitionKey: caseId,
            rowKey: rowKey,
            sender: sender || "Anonymous User",
            message: message,
            sentAt: new Date().toISOString()
        };

        await tableClient.createEntity(entity);

        return new Response(
            JSON.stringify({
                success: true,
                caseId,
                rowKey
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500 }
        );
    }
}
