// Utility to get the current user's group role from the group members list
interface GroupMember {
    id: string;
    role?: string | null;
}

export default function getUserGroupRole(
    userId: string,
    members: GroupMember[] | null | undefined
): string | null {
    if (!Array.isArray(members)) return null;
    const member = members.find((m: GroupMember) => m.id === userId);
    return member?.role || null;
}
