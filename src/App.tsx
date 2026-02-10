import { useState, useEffect, useRef, useCallback } from 'react'
import {
  CaretLargeLeftIcon,
  ArrowRightRectangleIcon,
  Button,
  CaretSmallDownIcon,
  CaretLargeRightIcon,
  Checkbox,
  BuildingIcon,
  DotsThreeHorizontalIcon,
  FileArrowDownIcon,

  LightningFillIcon,
  Heading,
  Icon,
  IconButton,
  LinkIcon,
  LockIcon,
  Logo,
  Menu,
  PencilIcon,
  PlusIcon,

  SlidersIcon,

  StarFillIcon,
  Switch,
  Text,
  TextField,
  ThemeProvider,
  Toast,
  UserIcon,
  UsersIcon,
  XIcon,
} from '@grammarly/origin'

type Plan = 'free' | 'pro' | 'enterprise'

interface Team {
  id: string
  name: string
  planLabel: string
  role: 'admin' | 'member'
}

interface Member {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  status: 'active' | 'pending'
  avatarInitials: string
}

interface Invite {
  id: string
  email: string
  role: 'admin' | 'member'
  sentAt: string
  sentBy: string
}

type SettingsTab =
  | 'profile' | 'preferences' | 'security' | 'connected'
  | 'workspace' | 'signout'

type OverlayView = 'tabs' | 'close-account' | 'close-resolve' | 'close-export' | 'workspace-members'

const DEMO_TEAMS: Record<Plan, Team[]> = {
  free: [],
  pro: [{ id: 't1', name: "Bobby's Workspace", planLabel: 'Pro — $10/month per seat', role: 'admin' }],
  enterprise: [
    { id: 't2', name: 'Acme Corp', planLabel: 'Enterprise', role: 'member' },
    { id: 't1', name: "Bobby's Workspace", planLabel: 'Enterprise', role: 'admin' },
  ],
}

const CURRENT_USER_EMAIL = 'bobby@kenner.com'

const DEMO_MEMBERS: Record<string, Member[]> = {
  t1: [
    { id: 'm1', name: 'Bobby Kenner', email: 'bobby@kenner.com', role: 'admin', status: 'active', avatarInitials: 'BO' },
  ],
  t2: [
    { id: 'm2', name: 'Alice Chen', email: 'alice@acme.com', role: 'admin', status: 'active', avatarInitials: 'AC' },
    { id: 'm1', name: 'Bobby Kenner', email: 'bobby@kenner.com', role: 'member', status: 'active', avatarInitials: 'BO' },
    { id: 'm3', name: 'Dan Park', email: 'dan@acme.com', role: 'admin', status: 'active', avatarInitials: 'DP' },
  ],
}

const DEMO_INVITES: Record<string, Invite[]> = {
  t1: [
    { id: 'i1', email: 'sarah@example.com', role: 'member', sentAt: '2 days ago', sentBy: 'Bobby Kenner' },
  ],
  t2: [
    { id: 'i2', email: 'mike@acme.com', role: 'member', sentAt: '1 day ago', sentBy: 'Alice Chen' },
    { id: 'i3', email: 'lisa@acme.com', role: 'admin', sentAt: '3 days ago', sentBy: 'Dan Park' },
  ],
}

const PORT = window.location.port

function urlWithPlan(subdomain: string, plan: Plan, extra = '') {
  return `http://${subdomain}.localhost:${PORT}?plan=${plan}${extra}`
}

function getPlanFromUrl(): Plan {
  const params = new URLSearchParams(window.location.search)
  const p = params.get('plan')
  if (p === 'free' || p === 'pro' || p === 'enterprise') return p
  return 'pro'
}

function PageTitle({ title }: { title: string }) {
  return <Heading as="h2" variant="heading-small">{title}</Heading>
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return <div className="settings-card">{children}</div>
}

function ContentSection({ label, description, children }: { label: string; description?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <Text as="p" variant="text-small" weight="medium">{label}</Text>
        {description && <Text as="p" variant="text-small" color="base-subdued">{description}</Text>}
      </div>
      {children}
    </div>
  )
}

type SettingsRowVariant = 'clickable' | 'action'

function SettingsRow({ variant = 'action', label, description, value, icon, actions, overflowActions, onClick }: {
  variant?: SettingsRowVariant
  label: string
  description?: string
  value?: React.ReactNode
  icon?: typeof PencilIcon
  actions?: React.ReactNode
  overflowActions?: { label: string; onClick?: () => void }[]
  onClick?: () => void
}) {
  const isClickable = variant === 'clickable'

  const content = (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-half)', flex: 1, minWidth: 0 }}>
        <Text as="p" variant="text-small">{label}</Text>
        {description && <Text as="p" variant="text-small" color="base-subdued">{description}</Text>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
        {isClickable && value && (typeof value === 'string' ? <Text as="p" variant="text-small" color="base-subdued">{value}</Text> : value)}
        {isClickable && icon && <Icon icon={icon} size="small" accessibilityLabel="" style={{ color: 'var(--color-text-base-subdued)' }} />}
        {!isClickable && actions}
        {overflowActions && overflowActions.length > 0 && (
          <div className="settings-action-menu">
            <Menu
              activator={
                <Button text="" variant="ghost" size="small" iconStart={DotsThreeHorizontalIcon} aria-label="More actions" />
              }
              accessibilityLabel="More actions"
            >
              {overflowActions.map(action => (
                <Menu.Item key={action.label} onClick={action.onClick}>{action.label}</Menu.Item>
              ))}
            </Menu>
          </div>
        )}
      </div>
    </>
  )

  const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-6)' }

  if (isClickable) {
    return (
      <button className="settings-row settings-row-clickable" style={rowStyle} onClick={onClick}>
        {content}
      </button>
    )
  }

  return (
    <div className="settings-row" style={rowStyle}>
      {content}
    </div>
  )
}

function ProfileSettings({ onCloseAccount, teams }: { onCloseAccount: () => void; teams: Team[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageTitle title="Profile" />
      <SettingsCard>
        <SettingsRow variant="clickable" label="Avatar" icon={PencilIcon} value={
          <span className="profile-menu-avatar">
            <Text as="span" variant="text-small" weight="semibold" style={{ color: 'var(--color-background-base-default)' }}>BO</Text>
          </span>
        } />
        <SettingsRow variant="clickable" label="Full name" value="Bobby Kenner" icon={PencilIcon} />
        <SettingsRow variant="clickable" label="Email" value="bobby@kenner.com" icon={PencilIcon} />
        <SettingsRow variant="clickable" label="Password" value="Last changed 3 months ago" icon={PencilIcon} />
      </SettingsCard>
      <ContentSection label={teams.length > 0 ? 'Workspace access' : 'Account access'}>
        <SettingsCard>
          <SettingsRow
            variant="clickable" icon={CaretLargeRightIcon}
            label="Close account"
            description={teams.length > 0 ? 'Remove from all workspaces' : 'Schedule deletion'}
            onClick={onCloseAccount}
          />
        </SettingsCard>
      </ContentSection>
    </div>
  )
}

const CLOSE_ACCOUNT_PRODUCTS = [
  { name: 'Coda', description: '12 docs, 3 shared with others' },
  { name: 'Superhuman', description: '2 email accounts connected' },
  { name: 'Grammarly', description: 'Custom dictionary, writing stats' },
]

function CloseAccount({ onBack, onNavigate, teams }: { onBack: () => void; onNavigate: (view: OverlayView) => void; teams: Team[] }) {
  const [code, setCode] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const email = 'bobby@kenner.com'
  const canDelete = code.length === 6 && acknowledged

  const blockers = teams.filter(t => t.role === 'admin')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <button onClick={onBack} className="settings-breadcrumb-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <Icon icon={CaretLargeLeftIcon} size="small" accessibilityLabel="" style={{ color: 'var(--color-text-base-subdued)' }} />
        <Text as="span" variant="text-small" color="base-subdued">Profile</Text>
      </button>
      <PageTitle title="Close account" />
      <Text as="p" variant="text-small">
        Your account will be deactivated immediately and permanently deleted after 30 days. You can reactivate anytime during this window.
        {teams.length > 0 && ' You will also be removed from all workspaces you belong to.'}
      </Text>

      <SettingsCard>
        {blockers.length > 0 && (
          <SettingsRow
            variant="clickable" icon={CaretLargeRightIcon}
            label="Resolve"
            description={`${blockers.length} ${blockers.length === 1 ? 'item' : 'items'}`}
            onClick={() => onNavigate('close-resolve')}
          />
        )}
        <SettingsRow
          variant="clickable" icon={CaretLargeRightIcon}
          label="Export data"
          description={`${CLOSE_ACCOUNT_PRODUCTS.length} products`}
          onClick={() => onNavigate('close-export')}
        />
      </SettingsCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <TextField
          label={`Enter deletion code sent to ${email}`}
          placeholder="Enter the deletion code"
          value={code}
          size="medium"
          onChange={(v) => setCode(v)}
        />
        <Checkbox
          isSelected={acknowledged}
          onChange={() => setAcknowledged(prev => !prev)}
        >
          I acknowledge that all of my account data will be deleted and want to proceed.
        </Checkbox>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button text="Delete my account" variant="primary" size="small" isDisabled={!canDelete} />
          <Button text="Cancel" variant="tertiary" size="small" onClick={onBack} />
        </div>
      </div>
    </div>
  )
}

function CloseResolveView({ onBack, teams }: { onBack: () => void; teams: Team[] }) {
  const blockers = teams
    .filter(t => t.role === 'admin')
    .map(t => ({ issue: `Sole admin on ${t.name}`, action: 'Transfer ownership' }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <button onClick={onBack} className="settings-breadcrumb-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <Icon icon={CaretLargeLeftIcon} size="small" accessibilityLabel="" style={{ color: 'var(--color-text-base-subdued)' }} />
        <Text as="span" variant="text-small" color="base-subdued">Close account</Text>
      </button>
      <PageTitle title="Resolve before closing" />
      <SettingsCard>
        {blockers.map(blocker => (
          <SettingsRow variant="action" key={blocker.issue} label={blocker.issue} actions={<Button text={blocker.action} variant="secondary" size="small" />} />
        ))}
      </SettingsCard>
    </div>
  )
}

function CloseExportView({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <button onClick={onBack} className="settings-breadcrumb-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <Icon icon={CaretLargeLeftIcon} size="small" accessibilityLabel="" style={{ color: 'var(--color-text-base-subdued)' }} />
        <Text as="span" variant="text-small" color="base-subdued">Close account</Text>
      </button>
      <PageTitle title="Export your data" />
      <SettingsCard>
        {CLOSE_ACCOUNT_PRODUCTS.map(product => (
          <SettingsRow variant="action" key={product.name} label={product.name} description={product.description} actions={<IconButton icon={FileArrowDownIcon} variant="tertiary" size="small" accessibilityLabel="Export" tooltipProps={{ placement: 'top' }} />} />
        ))}
      </SettingsCard>
    </div>
  )
}

function PreferencesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageTitle title="Preferences" />
      <SettingsCard>
        <SettingsRow variant="action" label="Dark mode" description="Use dark theme across all products" actions={<Switch label="Dark mode" labelDisplay="hidden" />} />
        <SettingsRow variant="action" label="Email notifications" description="Product updates and announcements" actions={<Switch label="Email notifications" labelDisplay="hidden" defaultSelected />} />
        <SettingsRow variant="action" label="Language" actions={
          <div className="settings-action-menu">
            <Menu
              activator={<Button text="English (US)" variant="secondary" size="small" iconEnd={CaretSmallDownIcon} />}
              accessibilityLabel="Language"
            >
              <Menu.Item key="en-us">English (US)</Menu.Item>
              <Menu.Item key="en-gb">English (UK)</Menu.Item>
              <Menu.Item key="es">Spanish</Menu.Item>
              <Menu.Item key="fr">French</Menu.Item>
              <Menu.Item key="de">German</Menu.Item>
              <Menu.Item key="pt">Portuguese</Menu.Item>
            </Menu>
          </div>
        } />
      </SettingsCard>
    </div>
  )
}

function SecurityTab() {
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const devices = [
    { name: 'Chrome on macOS', location: 'San Francisco, CA', current: true },
    { name: 'Superhuman iOS', location: 'San Francisco, CA', current: false },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageTitle title="Security" />
      <SettingsCard>
        <SettingsRow
          variant="action"
          label="Multi-factor authentication"
          description={mfaEnabled ? 'Enabled — authenticator app' : 'Not enabled'}
          actions={
            mfaEnabled
              ? <Button text="Manage" variant="secondary" size="small" onClick={() => setMfaEnabled(false)} />
              : <Button text="Set up" variant="secondary" size="small" onClick={() => setMfaEnabled(true)} />
          }
          overflowActions={mfaEnabled ? [{ label: 'View backup codes' }, { label: 'Disable' }] : undefined}
        />
        <SettingsRow variant="action" label="Account recovery" description="Not configured" actions={<Button text="Set up" variant="secondary" size="small" />} />
      </SettingsCard>

      <ContentSection label="Devices & sessions">
        <SettingsCard>
          {devices.map(device => (
            <SettingsRow
              variant="action"
              key={device.name}
              label={device.name}
              description={device.current ? `${device.location} · Current session` : device.location}
              actions={
                device.current
                  ? undefined
                  : <Button text="Revoke" variant="secondary" size="small" />
              }
            />
          ))}
        </SettingsCard>
      </ContentSection>
    </div>
  )
}

function ConnectedAccountsTab() {
  const accounts = [
    { provider: 'Google', email: 'bobby@gmail.com', connected: true },
    { provider: 'Apple', email: null, connected: false },
    { provider: 'Microsoft', email: null, connected: false },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageTitle title="Connected accounts" />
      <SettingsCard>
        {accounts.map(account => (
          <SettingsRow
            variant="action"
            key={account.provider}
            label={account.provider}
            description={account.connected ? account.email! : undefined}
            actions={
              account.connected
                ? <Button text="Disconnect" variant="secondary" size="small" />
                : <Button text="Connect" variant="secondary" size="small" />
            }
          />
        ))}
      </SettingsCard>
    </div>
  )
}

function WorkspaceTab({ team, onNavigate }: { team: Team; onNavigate?: (view: OverlayView) => void }) {
  const memberCount = (DEMO_MEMBERS[team.id] ?? []).filter(m => m.status === 'active').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageTitle title={team.name} />
      <SettingsCard>
        <SettingsRow variant="action" label="Workspace name" description={team.name} actions={<Button text="Update" variant="secondary" size="small" />} />
        <SettingsRow variant="action" label="Plan" description={team.planLabel} actions={<Button text="Manage" variant="secondary" size="small" />} />
      </SettingsCard>

      <SettingsCard>
        <SettingsRow
          variant="clickable" icon={CaretLargeRightIcon}
          label="Members"
          description={`${memberCount} ${memberCount === 1 ? 'member' : 'members'}`}
          onClick={() => onNavigate?.('workspace-members')}
        />
        <SettingsRow variant="clickable" icon={CaretLargeRightIcon} label="Billing" description="Payments and invoices" onClick={() => {}} />
      </SettingsCard>

      {team.role !== 'member' && (
        <ContentSection label="Workspace access">
          <SettingsCard>
            <SettingsRow variant="clickable" icon={CaretLargeRightIcon} label="Delete workspace" onClick={() => {}} />
          </SettingsCard>
        </ContentSection>
      )}
    </div>
  )
}

function MemberList({ members, isAdmin }: { members: Member[]; isAdmin: boolean }) {
  return (
    <SettingsCard>
      {members.map(member => (
        <div className="member-row" key={member.id}>
          <span className="member-avatar">
            <Text as="span" variant="text-xsmall" weight="semibold" style={{ color: '#fff' }}>{member.avatarInitials}</Text>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text as="p" variant="text-small">{member.name}</Text>
            <Text as="p" variant="text-small" color="base-subdued">{member.email}</Text>
          </div>
          {member.role === 'admin' && (
            <Text as="span" variant="text-small" color="base-subdued">Admin</Text>
          )}
          {isAdmin && member.email !== CURRENT_USER_EMAIL && (
            <div className="member-row-actions">
              <Menu
                activator={
                  <IconButton icon={DotsThreeHorizontalIcon} variant="tertiary" size="small" accessibilityLabel="More actions" tooltipProps={{ placement: 'top' }} />
                }
                accessibilityLabel="Member actions"
              >
                <Menu.Item key="change-role">Change role</Menu.Item>
                <Menu.Item key="remove">Remove from workspace</Menu.Item>
              </Menu>
            </div>
          )}
        </div>
      ))}
    </SettingsCard>
  )
}

function InviteList({ invites }: { invites: Invite[] }) {
  return (
    <SettingsCard>
      {invites.map(invite => {
        const byYou = invite.sentBy === 'Bobby Kenner'
        return (
          <div className="member-row" key={invite.id}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text as="p" variant="text-small">{invite.email}</Text>
              <Text as="p" variant="text-small" color="base-subdued">
                Invited {invite.sentAt} by {byYou ? 'you' : invite.sentBy}
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Button text="Resend" variant="secondary" size="small" />
              <Button text="Revoke" variant="secondary" size="small" />
            </div>
          </div>
        )
      })}
    </SettingsCard>
  )
}

function WorkspaceMembersView({ team, onBack }: { team: Team; onBack: () => void }) {
  const members = DEMO_MEMBERS[team.id] ?? []
  const invites = DEMO_INVITES[team.id] ?? []
  const isAdmin = team.role !== 'member'
  const activeMembers = members.filter(m => m.status === 'active')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <button onClick={onBack} className="settings-breadcrumb-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <Icon icon={CaretLargeLeftIcon} size="small" accessibilityLabel="" style={{ color: 'var(--color-text-base-subdued)' }} />
        <Text as="span" variant="text-small" color="base-subdued">{team.name}</Text>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <PageTitle title="Members" />
        {isAdmin && <Button text="Invite" variant="secondary" size="small" iconStart={PlusIcon} />}
      </div>

      <MemberList members={activeMembers} isAdmin={isAdmin} />

      {isAdmin && invites.length > 0 && (
        <ContentSection label="Pending invites">
          <InviteList invites={invites} />
        </ContentSection>
      )}
    </div>
  )
}

function SignOutTab() {
  const products = [
    { name: 'Superhuman', email: 'bobby@kenner.com' },
    { name: 'Coda', email: 'bobby@kenner.com' },
    { name: 'Grammarly', email: 'bobby@kenner.com' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <PageTitle title="Sign out" />
      <SettingsCard>
        <SettingsRow
          variant="action"
          label="Sign out of all products"
          description="End all active sessions"
          actions={<Button text="Sign out of all" variant="secondary" size="small" />}
        />
      </SettingsCard>
      <ContentSection label="Individual products">
        <SettingsCard>
          {products.map(product => (
            <SettingsRow
              variant="action"
              key={product.name}
              label={product.name}
              description={product.email}
              actions={<Button text="Sign out" variant="secondary" size="small" />}
            />
          ))}
        </SettingsCard>
      </ContentSection>
    </div>
  )
}

function EndOfContent() {
  return (
    <div className="settings-end-of-content">
      <div className="settings-end-dot" />
    </div>
  )
}

// ── Settings content (shared between settings.localhost and the old modal) ──

function SettingsContent({ plan, teams }: {
  plan: Plan
  teams: Team[]
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [activeTeamId, setActiveTeamId] = useState<string | null>(teams[0]?.id ?? null)
  const [view, setView] = useState<OverlayView>('tabs')
  const [showToast, setShowToast] = useState(false)

  const [renderedTab, setRenderedTab] = useState<SettingsTab>(activeTab)
  const [renderedTeamId, setRenderedTeamId] = useState<string | null>(activeTeamId)
  const [renderedView, setRenderedView] = useState<OverlayView>(view)
  const [fading, setFading] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const check = () => setIsScrollable(el.scrollHeight > el.clientHeight)
    requestAnimationFrame(check)
    const observer = new ResizeObserver(() => requestAnimationFrame(check))
    observer.observe(el)
    return () => observer.disconnect()
  }, [renderedTab, renderedTeamId, renderedView])

  useEffect(() => {
    const changed = activeTab !== renderedTab || activeTeamId !== renderedTeamId || view !== renderedView
    if (!changed) return
    setFading(true)
    const timer = setTimeout(() => {
      setRenderedTab(activeTab)
      setRenderedTeamId(activeTeamId)
      setRenderedView(view)
      setFading(false)
    }, 150)
    return () => clearTimeout(timer)
  }, [activeTab, activeTeamId, view])

  useEffect(() => {
    if (teams.length > 0 && !teams.find(t => t.id === activeTeamId)) {
      setActiveTeamId(teams[0].id)
    }
    if (teams.length === 0) {
      setActiveTeamId(null)
      if (activeTab === 'workspace') {
        setActiveTab('profile')
      }
    }
  }, [teams])

  const renderedTeam = teams.find(t => t.id === renderedTeamId) ?? null

  const accountItems: { id: SettingsTab; label: string; icon: typeof UserIcon }[] = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'preferences', label: 'Preferences', icon: SlidersIcon },
    { id: 'security', label: 'Security', icon: LockIcon },
    { id: 'connected', label: 'Connected accounts', icon: LinkIcon },
    { id: 'signout', label: 'Sign out', icon: ArrowRightRectangleIcon },
  ]

  const backToTabs = () => {
    setView('tabs')
    setShowToast(false)
  }

  const backToCloseAccount = () => {
    setView('close-account')
  }

  const selectWorkspace = (teamId: string) => {
    setActiveTeamId(teamId)
    setActiveTab('workspace')
    backToTabs()
  }

  const canCreateTeam = plan === 'pro' || plan === 'enterprise'

  const accountNavItems = accountItems.map(item => (
    <Menu.Item
      key={item.id}
      icon={item.icon}
      onClick={() => { setActiveTab(item.id); backToTabs() }}
      className={activeTab === item.id ? 'settings-nav-active' : undefined}
    >
      {item.label}
    </Menu.Item>
  ))

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', position: 'relative' }}>
      <nav className="settings-sidebar">
        <ul className="gds-menu-list settings-nav-list">
          {teams.length > 0 ? (
            <Menu.Section label="Account">{accountNavItems}</Menu.Section>
          ) : (
            accountNavItems
          )}
          {teams.length > 0 && (
            <Menu.Section label="Workspaces">
              {teams.map(team => (
                <Menu.Item
                  key={team.id}
                  icon={team.role === 'member' ? BuildingIcon : UsersIcon}
                  onClick={() => selectWorkspace(team.id)}
                  className={activeTab === 'workspace' && activeTeamId === team.id ? 'settings-nav-active' : undefined}
                >
                  {team.name}
                </Menu.Item>
              ))}
              {canCreateTeam && <Menu.Item key="create" icon={PlusIcon} onClick={() => {}}>Create</Menu.Item>}
            </Menu.Section>
          )}
        </ul>
      </nav>

      <div ref={contentRef} className={`settings-content${fading ? ' settings-content-fading' : ''}`} style={{ flex: 1, minWidth: 0 }}>
        {renderedView === 'tabs' && renderedTab === 'profile' && <ProfileSettings onCloseAccount={() => setView('close-account')} teams={teams} />}
        {renderedView === 'tabs' && renderedTab === 'preferences' && <PreferencesTab />}
        {renderedView === 'tabs' && renderedTab === 'security' && <SecurityTab />}
        {renderedView === 'tabs' && renderedTab === 'connected' && <ConnectedAccountsTab />}
        {renderedView === 'tabs' && renderedTab === 'workspace' && renderedTeam && <WorkspaceTab team={renderedTeam} onNavigate={setView} />}
        {renderedView === 'tabs' && renderedTab === 'signout' && <SignOutTab />}
        {renderedView === 'tabs' && isScrollable && <EndOfContent />}

        {renderedView === 'workspace-members' && renderedTeam && (
          <WorkspaceMembersView team={renderedTeam} onBack={backToTabs} />
        )}

        {renderedView === 'close-account' && (
          <CloseAccount onBack={backToTabs} onNavigate={setView} teams={teams} />
        )}

        {renderedView === 'close-resolve' && (
          <CloseResolveView onBack={backToCloseAccount} teams={teams} />
        )}

        {renderedView === 'close-export' && (
          <CloseExportView onBack={backToCloseAccount} />
        )}
      </div>

      {showToast && (
        <div style={{ position: 'absolute', bottom: 'var(--space-6)', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Toast
            text="Deletion verification code sent to bobby@kenner.com"
            variant="success"
            onClose={() => setShowToast(false)}
          />
        </div>
      )}
    </div>
  )
}

// ── Standalone page wrapper for account.localhost and admin.localhost ──

function StandalonePage({ backLabel, backHref, children }: {
  title?: string
  backLabel: string
  backHref: string
  children: React.ReactNode
}) {
  return (
    <div className="standalone-page">
      <div className="standalone-page-inner">
        <a href={backHref} className="settings-breadcrumb-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', textDecoration: 'none' }}>
          <Icon icon={CaretLargeLeftIcon} size="small" accessibilityLabel="" style={{ color: 'var(--color-text-base-subdued)' }} />
          <Text as="span" variant="text-small" color="base-subdued">{backLabel}</Text>
        </a>
        {children}
      </div>
    </div>
  )
}

// ── account.localhost ──

const ACCOUNT_SECTIONS = ['profile', 'preferences', 'security', 'connected', 'signout', 'close-account'] as const
type AccountSection = typeof ACCOUNT_SECTIONS[number]

function AccountPage({ plan }: { plan: Plan }) {
  const teams = DEMO_TEAMS[plan]
  const params = new URLSearchParams(window.location.search)
  const section = (params.get('section') ?? 'profile') as AccountSection

  const renderSection = () => {
    switch (section) {
      case 'profile': return <ProfileSettings onCloseAccount={() => { window.location.href = urlWithPlan('account', plan, '&section=close-account') }} teams={teams} />
      case 'preferences': return <PreferencesTab />
      case 'security': return <SecurityTab />
      case 'connected': return <ConnectedAccountsTab />
      case 'signout': return <SignOutTab />
      case 'close-account': return <CloseAccount onBack={() => { window.location.href = urlWithPlan('account', plan, '&section=profile') }} onNavigate={() => {}} teams={teams} />
      default: return <ProfileSettings onCloseAccount={() => {}} teams={teams} />
    }
  }

  return (
    <StandalonePage title="Account Settings" backLabel="Back to app" backHref={urlWithPlan('home', plan)}>
      {renderSection()}
    </StandalonePage>
  )
}

// ── admin.localhost ──

type AdminSection = 'members' | 'settings'

function AdminMembersSection({ team, members, invites }: {
  team: Team
  members: Member[]
  invites: Invite[]
}) {
  const isAdmin = team.role !== 'member'
  const activeMembers = members.filter(m => m.status === 'active')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <PageTitle title="Members" />
        {isAdmin && <Button text="Invite" variant="secondary" size="small" iconStart={PlusIcon} />}
      </div>

      <MemberList members={activeMembers} isAdmin={isAdmin} />

      {isAdmin && invites.length > 0 && (
        <ContentSection label="Pending invites">
          <InviteList invites={invites} />
        </ContentSection>
      )}
    </div>
  )
}

function SectionTabBar({ tabs, activeTab, plan, teamId, subdomain }: {
  tabs: { id: string; label: string }[]
  activeTab: string
  plan: Plan
  teamId: string
  subdomain: string
}) {
  return (
    <div className="section-tab-bar">
      {tabs.map(tab => (
        <a
          key={tab.id}
          href={urlWithPlan(subdomain, plan, `&team=${teamId}&section=${tab.id}`)}
          className={`section-tab${activeTab === tab.id ? ' section-tab-active' : ''}`}
        >
          <Text as="span" variant="text-small">{tab.label}</Text>
        </a>
      ))}
    </div>
  )
}

function AdminPage({ plan }: { plan: Plan }) {
  const teams = DEMO_TEAMS[plan]
  const params = new URLSearchParams(window.location.search)
  const teamId = params.get('team') ?? teams[0]?.id
  const team = teams.find(t => t.id === teamId)
  const section = (params.get('section') ?? 'members') as AdminSection
  const members = DEMO_MEMBERS[teamId ?? ''] ?? []
  const invites = DEMO_INVITES[teamId ?? ''] ?? []

  if (!team) {
    return (
      <StandalonePage title="Workspace Admin" backLabel="Back to app" backHref={urlWithPlan('home', plan)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
          <PageTitle title="No workspace" />
          <Text as="p" variant="text-small" color="base-subdued">
            Workspace admin is only available for Pro and Enterprise plans.
          </Text>
        </div>
      </StandalonePage>
    )
  }

  const adminTabs = [
    { id: 'members', label: 'Members' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <StandalonePage title="Workspace Admin" backLabel="Back to app" backHref={urlWithPlan('home', plan)}>
      <PageTitle title={team.name} />
      <SectionTabBar tabs={adminTabs} activeTab={section} plan={plan} teamId={team.id} subdomain="admin" />
      {section === 'members' && <AdminMembersSection team={team} members={members} invites={invites} />}
      {section === 'settings' && <WorkspaceTab team={team} />}
    </StandalonePage>
  )
}

// ── settings.localhost — full-page settings designed to be iframed ──

function SettingsPage({ plan }: { plan: Plan }) {
  const teams = DEMO_TEAMS[plan]

  const handleClose = useCallback(() => {
    window.parent.postMessage({ type: 'close' }, '*')
  }, [])

  return (
    <div className="settings-page">
      <button className="settings-page-close" onClick={handleClose} aria-label="Close settings">
        <Icon icon={XIcon} size="small" accessibilityLabel="Close" />
      </button>
      <SettingsContent plan={plan} teams={teams} />
    </div>
  )
}

// ── Demo accounts ──

const DEMO_ACCOUNTS: { email: string; plan: Plan; planLabel: string }[] = [
  { email: 'bobby@gmail.com', plan: 'free', planLabel: 'Free' },
  { email: 'bobby@kenner.com', plan: 'pro', planLabel: 'Pro' },
  { email: 'bobby@acme.com', plan: 'enterprise', planLabel: 'Enterprise' },
]

// ── SignInPage ──

function SignInPage({ onSignIn }: { onSignIn: (plan: Plan) => void }) {
  const isIframed = window.parent !== window

  const handleSignIn = (plan: Plan) => {
    if (isIframed) {
      window.parent.postMessage({ type: 'signin', plan }, '*')
    } else {
      onSignIn(plan)
    }
  }

  return (
    <div className="signin-page">
      <div className="signin-card">
        <Logo brand="superhuman" composition="mark" variant="color-primary" accessibilityLabel="Superhuman" style={{ width: 40, height: 40 }} />
        <Heading as="h1" variant="heading-medium" className="signin-heading">Continue to Superhuman</Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
          {DEMO_ACCOUNTS.map(account => (
            <button
              key={account.email}
              className="signin-account-button"
              onClick={() => handleSignIn(account.plan)}
            >
              <span className="profile-menu-avatar" style={{ width: 32, height: 32 }}>
                <Text as="span" variant="text-small" weight="semibold" style={{ color: 'var(--color-background-base-default)' }}>BO</Text>
              </span>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <Text as="p" variant="text-small">{account.email}</Text>
              </div>
              <Text as="span" variant="text-small" color="base-subdued">{account.planLabel}</Text>
            </button>
          ))}
        </div>
      </div>
      {!isIframed && (
        <div className="signin-footer">
          <Text as="p" variant="text-xsmall" color="base-subdued" style={{ textAlign: 'center' }}>
            By continuing, you agree to the ToS and Privacy Policy. California residents, see our CA Notice at Collection. You also agree to receive product-related marketing emails from Superhuman, which you can unsubscribe from at any time.
          </Text>
          <Text as="p" variant="text-xsmall" color="base-subdued" style={{ textAlign: 'center' }}>
            This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
          </Text>
        </div>
      )}
    </div>
  )
}

// ── home.localhost — main app shell with iframe modal ──

function HomePage({ plan, onPlanChange }: { plan: Plan; onPlanChange: (plan: Plan) => void }) {
  const [isSignedIn, setIsSignedIn] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)

  const handleSignOut = () => {
    setSettingsOpen(false)
    setIsSignedIn(false)
  }

  // Listen for postMessage from iframes (settings + sign-in)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'close') {
        setSettingsOpen(false)
      } else if (e.data?.type === 'signout') {
        handleSignOut()
      } else if (e.data?.type === 'signin') {
        setSignInOpen(false)
        setIsSignedIn(true)
        if (e.data.plan) onPlanChange(e.data.plan)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Cmd+, keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        if (isSignedIn) setSettingsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isSignedIn])

  return (
    <>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-6)', backgroundColor: 'var(--color-background-base-default)', borderBottom: '1px solid var(--color-border-base-subdued)' }}>
        <Logo brand="superhuman" composition="lockup" variant="color-secondary" accessibilityLabel="Superhuman" style={{ transform: 'scale(0.8)', transformOrigin: 'left center' }} />
        {isSignedIn ? (
          <div className="profile-menu-button-wrapper">
            <Menu
              activator={
                <button className="profile-menu-button" aria-label="Profile menu">
                  <span className="profile-menu-avatar">
                    <Text as="span" variant="text-small" weight="semibold" style={{ color: 'var(--color-background-base-default)' }}>BO</Text>
                    {plan !== 'free' && (
                      <span className={`avatar-badge avatar-badge-${plan}`}>
                        <Icon icon={plan === 'pro' ? StarFillIcon : LightningFillIcon} size="small" accessibilityLabel={plan} />
                      </span>
                    )}
                  </span>
                  <Text as="span" variant="text-small">Bobby Kenner</Text>
                  <Icon icon={CaretSmallDownIcon} size="small" accessibilityLabel="" style={{ color: 'var(--color-text-base-subdued)' }} />
                </button>
              }
              accessibilityLabel="Profile menu"
            >
              <Menu.Item key="settings" onClick={() => setSettingsOpen(true)}>Settings</Menu.Item>
              <Menu.Item key="signout" onClick={handleSignOut}>Sign out</Menu.Item>
            </Menu>
          </div>
        ) : (
          <button className="profile-menu-button" aria-label="Sign in" onClick={() => setSignInOpen(true)}>
            <span className="profile-menu-avatar" style={{ backgroundColor: 'var(--neutral-gray-20)' }}>
              <Icon icon={UserIcon} size="small" accessibilityLabel="" style={{ color: 'var(--color-background-base-default)' }} />
            </span>
            <Text as="span" variant="text-small" color="base-subdued">Sign in</Text>
          </button>
        )}
      </nav>

      <div style={{ padding: 'var(--space-10)' }} />

      {/* Iframe overlay for settings */}
      {settingsOpen && (
        <div className="settings-iframe-overlay" onClick={() => setSettingsOpen(false)}>
          <iframe
            className="settings-iframe"
            src={urlWithPlan('settings', plan)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Iframe overlay for sign-in */}
      {signInOpen && (
        <div className="settings-iframe-overlay" onClick={() => setSignInOpen(false)}>
          <iframe
            className="settings-iframe"
            src={urlWithPlan('id', plan)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </>
  )
}

// ── components.localhost — component reference ──

function ComponentsPage() {
  const [toggleOn, setToggleOn] = useState(false)

  return (
    <div className="standalone-page">
      <div className="standalone-page-inner" style={{ maxWidth: 520 }}>
        <SettingsCard>
          <SettingsRow variant="clickable" label="Label" description="Description" value="Value" icon={PencilIcon} />
        </SettingsCard>

        <SettingsCard>
          <SettingsRow variant="action" label="Label" description="Description" actions={<Button text="Action" variant="secondary" size="small" />} />
        </SettingsCard>

        <SettingsCard>
          <SettingsRow variant="action" label="Label" description="Description" actions={<Switch label="Toggle" labelDisplay="hidden" isSelected={toggleOn} onChange={() => setToggleOn(v => !v)} />} />
        </SettingsCard>

        <SettingsCard>
          <SettingsRow variant="action" label="Label" description="Description" actions={
            <div className="settings-action-menu">
              <Menu
                activator={<Button text="Value" variant="secondary" size="small" iconEnd={CaretSmallDownIcon} />}
                accessibilityLabel="Select"
              >
                <Menu.Item key="a">Option A</Menu.Item>
                <Menu.Item key="b">Option B</Menu.Item>
              </Menu>
            </div>
          } />
        </SettingsCard>

        <SettingsCard>
          <SettingsRow variant="action" label="Label" description="Description" />
        </SettingsCard>
      </div>
    </div>
  )
}

// ── App — subdomain router ──

function App() {
  const subdomain = window.location.hostname.split('.')[0]
  const [demoPlan, setDemoPlan] = useState<Plan>(getPlanFromUrl)

  // When plan changes on home, update URL without reload
  const handlePlanChange = (newPlan: Plan) => {
    setDemoPlan(newPlan)
    const url = new URL(window.location.href)
    url.searchParams.set('plan', newPlan)
    window.history.replaceState({}, '', url.toString())
  }

  const handleSignIn = (plan: Plan) => {
    setDemoPlan(plan)
    window.location.href = urlWithPlan('home', plan)
  }

  switch (subdomain) {
    case 'id':
      return (
        <ThemeProvider theme="superhuman" style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-base-subdued)', fontFamily: 'var(--font-stack-inter)' }}>
          <SignInPage onSignIn={handleSignIn} />
        </ThemeProvider>
      )

    case 'home':
      return (
        <ThemeProvider theme="superhuman" style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-base-subdued)', fontFamily: 'var(--font-stack-inter)' }}>
          <HomePage plan={demoPlan} onPlanChange={handlePlanChange} />
        </ThemeProvider>
      )

    case 'settings':
      return (
        <ThemeProvider theme="superhuman" style={{ minHeight: '100vh', fontFamily: 'var(--font-stack-inter)' }}>
          <SettingsPage plan={demoPlan} />
        </ThemeProvider>
      )

    case 'account':
      return (
        <ThemeProvider theme="superhuman" style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-base-subdued)', fontFamily: 'var(--font-stack-inter)' }}>
          <AccountPage plan={demoPlan} />
        </ThemeProvider>
      )

    case 'admin':
      return (
        <ThemeProvider theme="superhuman" style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-base-subdued)', fontFamily: 'var(--font-stack-inter)' }}>
          <AdminPage plan={demoPlan} />
        </ThemeProvider>
      )

    case 'components':
      return (
        <ThemeProvider theme="superhuman" style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-base-subdued)', fontFamily: 'var(--font-stack-inter)' }}>
          <ComponentsPage />
        </ThemeProvider>
      )

    default:
      // Fallback: redirect to home
      window.location.href = urlWithPlan('home', demoPlan)
      return null
  }
}

export default App
