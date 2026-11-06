import { useState, useEffect } from 'react';
import type { TeamMember } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../components/ui/select';
import { UserPlus, X, CheckCircle2 } from 'lucide-react';

export const TeamPage = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Staff' | 'Viewer'>('Staff');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getTeam().then(setTeam);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const added = await api.addTeamMember({
      name: inviteName.trim(),
      role: inviteRole,
      canEditOrders: inviteRole !== 'Viewer',
      canManageTeam: inviteRole === 'Admin',
      avatarColor: inviteRole === 'Admin' ? '#0f6b5c' : inviteRole === 'Staff' ? '#2f6fc8' : '#f2a33a',
    });

    setTeam((prev) => [...prev, added]);
    setToastMessage(`Team member ${added.name} successfully added and saved!`);
    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-[#bfe5d1] bg-[#d9f0e3] p-3 text-xs font-medium text-[#2e8b57]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#14302b]">Team & Roles</h2>
          <p className="text-xs text-[#6b7f7a]">
            Access permissions, team members, and role capabilities.
          </p>
        </div>

        <Button
          variant="accent"
          onClick={() => setIsInviteOpen(true)}
          className="gap-1.5"
        >
          <UserPlus className="h-4 w-4" />
          <span>Invite member</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-[#dde4e2] px-4 py-3 font-semibold text-xs text-[#14302b]">
          {team.length} members
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#dde4e2] text-[#6b7f7a]">
                <th className="py-2.5 pl-4 pr-3 font-medium">Member</th>
                <th className="px-3 py-2.5 font-medium">Role</th>
                <th className="px-3 py-2.5 font-medium">Can edit orders</th>
                <th className="py-2.5 pl-3 pr-4 font-medium">Can manage team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde4e2]">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-[#f9fbfa]">
                  <td className="flex items-center gap-2.5 py-3 pl-4 pr-3 font-semibold text-[#14302b]">
                    <div
                      style={{ backgroundColor: member.avatarColor || '#0f6b5c' }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    >
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <span>{member.name}</span>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={member.role} size="sm" />
                  </td>
                  <td className="px-3 py-3 text-[#14302b]">
                    {member.canEditOrders ? 'Yes' : 'No'}
                  </td>
                  <td className="py-3 pl-3 pr-4 text-[#14302b]">
                    {member.canManageTeam ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsInviteOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-[#dde4e2] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dde4e2] pb-3">
              <h3 className="text-sm font-bold text-[#14302b]">Invite Team Member</h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="rounded-lg p-1 text-[#6b7f7a] hover:bg-[#e4f0ed]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-[#6b7f7a] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#6b7f7a] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@orderly.test"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#dde4e2] bg-[#fbfcfc] p-2 text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#6b7f7a] mb-1">Role</label>
                <Select
                  value={inviteRole}
                  onValueChange={(val) => setInviteRole(val as 'Admin' | 'Staff' | 'Viewer')}
                >
                  <SelectTrigger className="w-full h-9 rounded-lg bg-[#fbfcfc] border-[#dde4e2]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staff">Staff (Can edit orders)</SelectItem>
                    <SelectItem value="Viewer">Viewer (Read-only)</SelectItem>
                    <SelectItem value="Admin">Admin (Full access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#dde4e2]">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="rounded-lg border border-[#dde4e2] px-3 py-1.5 text-xs font-semibold text-[#6b7f7a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#f2a33a] px-3.5 py-1.5 text-xs font-semibold text-[#2b1c00]"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
