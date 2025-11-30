import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

export async function handler(request, context) {
    try {
        const body = await request.json();
        const { mode, sender } = body;

        // 1) Generate Case ID
        const caseId = "C" + Math.random().toString(36).substring(2, 8).toUpperCase();

        // 2) Generate Unique 12-Character Passcode
        const passcode = [...Array(12)]
            .map(() => Math.random().toString(36)[2])
            .join("")
            .toUpperCase();

        // Storage credentials
        const account = process.env.STORAGE_ACCOUNT_NAME;
        const key = process.env.STORAGE_ACCOUNT_KEY;

        const tableUrl = `https://${account}.table.core.windows.net`;
        const credential = new AzureNamedKeyCredential(account, key);

        const tableClient = new TableClient(tableUrl, "Case", credential);

        // Create Case record
        const entity = {
            partitionKey: caseId,
            rowKey: passcode,
            mode: mode || "Anonymous",
            sender: sender || "Anonymous User",
            createdAt: new Date().toISOString()
        };

        await tableClient.createEntity(entity);

        return new Response(
            JSON.stringify({
                success: true,
                caseId,
                passcode
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
