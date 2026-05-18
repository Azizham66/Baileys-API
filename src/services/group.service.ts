import { getSock } from "@/whatsappClient";

export async function listGroups() {
  const sock = getSock();

  if (!sock) throw new Error("Not connected");

  const groups = await sock.groupFetchAllParticipating();

  return groups;
}

// --- Helper Formatting Functions ---

function formatGroup(groupId: string, metadata: any) {
  return {
    id: groupId,
    name: metadata.subject || "Unnamed Group",
    size: metadata.size || 0,
    canSendMessages: !metadata.announce,
    canEditGroupInfo: !metadata.restrict,
    isCommunity: !!metadata.isCommunity,
    ...(metadata.isCommunity && {
      linkedParent: metadata.linkedParent || null,
    }),
  };
}

function formatGroupMin(groupId: string, metadata: any) {
  return {
    id: groupId,
    name: metadata.subject || "Unnamed Group",
  };
}

// --- Group Services ---

export async function getGroups() {
  const groups = await listGroups();
  return Object.entries(groups).map(([groupId, metadata]) => formatGroup(groupId, metadata));
}

export async function getGroupByName(groupName: string) {
  const groups = await listGroups();

  const groupEntry = Object.entries(groups).find(
    ([_, metadata]) => metadata.subject === groupName,
  );
  if (!groupEntry) {
    throw new Error(`Group with name "${groupName}" not found`);
  }

  return formatGroup(groupEntry[0], groupEntry[1]);
}

export async function getGroupById(groupId: string) {
  const groups = await listGroups();

  const metadata = groups[groupId];
  if (!metadata) {
    throw new Error(`Group with ID "${groupId}" not found`);
  }

  return formatGroup(groupId, metadata);
}

export async function getGroupsMin() {
  const groups = await listGroups();

  return Object.entries(groups).map(([id, metadata]) => formatGroupMin(id, metadata));
}

export async function getGroupByNameMin(groupName: string) {
  const groups = await listGroups();

  const groupEntry = Object.entries(groups).find(
    ([_, metadata]) => metadata.subject === groupName,
  );
  
  return groupEntry ? formatGroupMin(groupEntry[0], groupEntry[1]) : null;
}

export async function getGroupByIdMin(groupId: string) {
  const groups = await listGroups();
  
  const metadata = groups[groupId];
  return metadata ? formatGroupMin(groupId, metadata) : null;
}
