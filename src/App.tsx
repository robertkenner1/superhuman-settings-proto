import { useState, useEffect, useRef, useCallback, isValidElement, cloneElement } from 'react'
import {
  ArrowRightRectangleIcon,
  CaretLargeLeftIcon,
  Button,
  CaretSmallDownIcon,
  CaretLargeRightIcon,
  Checkbox,
  BellIcon,
  BuildingIcon,
  DotsThreeHorizontalIcon,
  EyeIcon,
  Form,
  FormFooter,
  FormRow,

  Heading,
  Icon,
  IconButton,
  Link,
  LinkIcon,
  LockIcon,
  Logo,
  Menu,
  PencilIcon,
  PlanTag,
  PlusIcon,

  GearIcon,
  SlidersIcon,

  StarIcon,
  Switch,
  Text,
  ThemeProvider,
  TextField,
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
  avatarUrl?: string
}

interface Invite {
  id: string
  email: string
  role: 'admin' | 'member'
  sentAt: string
  sentBy: string
}

type SettingsTab =
  | 'profile' | 'preferences' | 'security' | 'connected' | 'data-privacy'
  | 'general' | 'members' | 'subscription'
  | 'signout'

type OverlayView = 'tabs' | 'close-account'

const DEMO_TEAMS: Record<Plan, Team[]> = {
  free: [{ id: 't1', name: "Morgan's Organization", planLabel: 'Free', role: 'admin' }],
  pro: [{ id: 't1', name: "Morgan's Workspace", planLabel: 'Pro — $10/month per seat', role: 'admin' }],
  enterprise: [{ id: 't2', name: 'Acme Corp', planLabel: 'Enterprise', role: 'admin' }],
}

const CURRENT_USER_EMAIL = 'morgan@taylor.com'

const DEMO_MEMBERS: Record<string, Member[]> = {
  t1: [
    { id: 'm1', name: 'Morgan Taylor', email: 'morgan@taylor.com', role: 'admin', status: 'active', avatarInitials: 'MT', avatarUrl: '/img/avatar.png' },
  ],
  t2: [
    { id: 'm2', name: 'Alice Chen', email: 'alice@acme.com', role: 'admin', status: 'active', avatarInitials: 'AC' },
    { id: 'm1', name: 'Morgan Taylor', email: 'morgan@taylor.com', role: 'member', status: 'active', avatarInitials: 'MT' },
    { id: 'm3', name: 'Dan Park', email: 'dan@acme.com', role: 'admin', status: 'active', avatarInitials: 'DP' },
  ],
}

const DEMO_INVITES: Record<string, Invite[]> = {
  t1: [
    { id: 'i1', email: 'sarah@example.com', role: 'member', sentAt: '2 days ago', sentBy: 'Morgan Taylor' },
  ],
  t2: [
    { id: 'i2', email: 'mike@acme.com', role: 'member', sentAt: '1 day ago', sentBy: 'Alice Chen' },
    { id: 'i3', email: 'lisa@acme.com', role: 'admin', sentAt: '3 days ago', sentBy: 'Dan Park' },
  ],
}

const IS_LOCAL = window.location.hostname.endsWith('localhost')
const PORT = window.location.port
const BASE_ORIGIN = IS_LOCAL ? '' : `${window.location.protocol}//${window.location.host}`

function urlWithPlan(subdomain: string, plan: Plan, extra = '') {
  if (IS_LOCAL) {
    return `http://${subdomain}.localhost:${PORT}?plan=${plan}${extra}`
  }
  return `${BASE_ORIGIN}/${subdomain}?plan=${plan}${extra}`
}

function getRoute(): string {
  if (IS_LOCAL) {
    return window.location.hostname.split('.')[0]
  }
  // Path-based: /home, /settings, /id, /account, /admin, /components
  const path = window.location.pathname.split('/')[1] || ''
  return path || 'home'
}

function getPlanFromUrl(): Plan {
  const params = new URLSearchParams(window.location.search)
  const p = params.get('plan')
  if (p === 'free' || p === 'pro' || p === 'enterprise') return p
  return 'pro'
}

function PageTitle({ title }: { title: string }) {
  return <Heading as="h2" variant="heading-small" style={{}}>{title}</Heading>
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return <div className="settings-card">{children}</div>
}

function ContentSection({ label, description, children }: { label: string; description?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <Text as="p" variant="text-small" weight="medium">{label}</Text>
        {description && <Text as="p" variant="text-small" color="base-subdued">{description}</Text>}
      </div>
      {children}
    </div>
  )
}

type SettingsRowVariant = 'clickable' | 'action'

function SettingsRow({ variant = 'action', label, description, value, icon, actions, overflowActions, onClick, external }: {
  variant?: SettingsRowVariant
  label: string
  description?: string
  value?: React.ReactNode
  icon?: typeof PencilIcon
  actions?: React.ReactNode
  overflowActions?: { label: string; onClick?: () => void }[]
  onClick?: () => void
  external?: boolean
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
        {!isClickable && external && actions && isValidElement(actions) && (actions as React.ReactElement<{ text?: string }>).props.text ? (
          cloneElement(actions as React.ReactElement<{ text: string }>, { text: `${(actions as React.ReactElement<{ text: string }>).props.text} ↗` })
        ) : (
          !isClickable && actions
        )}
        {overflowActions && overflowActions.length > 0 && (
          <div className="settings-action-menu">
            <Menu
              activator={
                <IconButton icon={DotsThreeHorizontalIcon} variant="tertiary" size="small" accessibilityLabel="More actions" />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <PageTitle title="Profile" />
      <SettingsCard>
        <SettingsRow variant="clickable" label="Avatar" icon={PencilIcon} value={
          <img src="/img/avatar.png" alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
        } />
        <SettingsRow variant="clickable" label="Full name" value="Morgan Taylor" icon={PencilIcon} />
        <SettingsRow variant="clickable" label="Email" value="morgan@taylor.com" icon={PencilIcon} />
        <SettingsRow variant="clickable" label="Password" value="Last changed 3 months ago" icon={PencilIcon} />
      </SettingsCard>
      <ContentSection label={teams.length > 0 ? 'Workspace access' : 'Account access'}>
        <SettingsCard>
          <SettingsRow
            variant="clickable" icon={CaretLargeRightIcon}
            label="Delete account"
            description={teams.length > 0 ? 'Remove from all workspaces' : 'Schedule deletion'}
            onClick={onCloseAccount}
          />
        </SettingsCard>
      </ContentSection>
    </div>
  )
}


function CloseAccount({ onBack, teams }: { onBack: () => void; teams: Team[] }) {
  const [code, setCode] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [checkboxError, setCheckboxError] = useState('')
  const email = 'morgan@taylor.com'

  const handleDelete = () => {
    let hasError = false
    if (code.length !== 6) {
      setCodeError('Enter the 6-digit code from your email')
      hasError = true
    }
    if (!acknowledged) {
      setCheckboxError('You must acknowledge to continue')
      hasError = true
    }
    if (hasError) return
    // proceed with deletion
  }

  const handleExportRequest = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'export-requested' }, '*')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <button onClick={onBack} className="settings-breadcrumb-link" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <Icon icon={CaretLargeLeftIcon} size="small" accessibilityLabel="" style={{ color: 'var(--color-text-base-subdued)' }} />
        <Text as="span" variant="text-small" color="base-subdued">Profile</Text>
      </button>
      <PageTitle title="Delete your account" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Text as="p" variant="text-small">
          Once you close your account, you won't be able to access your data. If you need it, <Link href="#" variant="inherit" onClick={(e: React.MouseEvent) => { e.preventDefault(); handleExportRequest() }}>request an export</Link>.
        </Text>
        <Text as="p" variant="text-small">
          We'll deactivate your account now and delete it after 30 days.{teams.length > 0 && ' You will also be removed from all workspaces.'} You can reactivate anytime before then.
        </Text>
        <Text as="p" variant="text-small">
          We sent a verification code to {email} — it expires in 10 minutes.
        </Text>
      </div>

      <Form className="close-account-controls" spacing="standard" onSubmit={(e) => e.preventDefault()}>
        <FormRow>
          <TextField
            label="Verification code"
            placeholder="583291"
            value={code}
            errorMessage={codeError || undefined}
            onChange={(v) => { setCode(v); setCodeError('') }}
          />
        </FormRow>
        <FormRow>
          <Checkbox
            isSelected={acknowledged}
            errorMessage={checkboxError || undefined}
            onChange={() => { setAcknowledged(prev => !prev); setCheckboxError('') }}
          >
            I understand this is permanent
          </Checkbox>
        </FormRow>
        <FormFooter>
          <Button text="Delete my account" variant="primary" size="medium" onClick={handleDelete} />
        </FormFooter>
      </Form>
    </div>
  )
}


function PreferencesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
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
    { provider: 'Google', email: 'morgan@gmail.com', connected: true },
    { provider: 'Apple', email: null, connected: false },
    { provider: 'Microsoft', email: null, connected: false },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
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

function DataPrivacyTab() {
  const [aiTraining, setAiTraining] = useState(false)
  const [analyticsSharing, setAnalyticsSharing] = useState(true)
  const [exportRequested, setExportRequested] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <PageTitle title="Data & privacy" />
      <SettingsCard>
        <SettingsRow
          variant="action"
          label="Use my data to improve AI models"
          description="When enabled, your content may be used to train and improve AI features across Superhuman products"
          actions={<Switch label="AI training" labelDisplay="hidden" isSelected={aiTraining} onChange={() => setAiTraining(v => !v)} />}
        />
      </SettingsCard>
      <ContentSection label="Your data">
        <SettingsCard>
          <SettingsRow
            variant="action"
            label="Export your data"
            description={exportRequested ? 'Export in progress — we\'ll email you when it\'s ready' : 'Download a copy of all your data across Superhuman products'}
            actions={<Button text={exportRequested ? 'Requested' : 'Request'} variant="secondary" size="small" onClick={() => setExportRequested(true)} />}
          />
          <SettingsRow
            variant="action"
            label="Share usage data with analytics providers"
            description="Helps us understand how products are used to improve the experience"
            actions={<Switch label="Analytics sharing" labelDisplay="hidden" isSelected={analyticsSharing} onChange={() => setAnalyticsSharing(v => !v)} />}
          />
        </SettingsCard>
      </ContentSection>
    </div>
  )
}

function WorkspaceTab({ team }: { team: Team }) {
  const memberCount = (DEMO_MEMBERS[team.id] ?? []).filter(m => m.status === 'active').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <PageTitle title={team.name} />
      <SettingsCard>
        <SettingsRow variant="action" label="Workspace name" description={team.name} actions={<Button text="Update" variant="secondary" size="small" />} />
        <SettingsRow variant="action" label="Plan" description={team.planLabel} actions={<Button text="Manage" variant="secondary" size="small" />} />
      </SettingsCard>

      <ContentSection label="Workspace">
        <SettingsCard>
          <SettingsRow
            variant="clickable" icon={CaretLargeRightIcon}
            label="Members"
            description={`${memberCount} ${memberCount === 1 ? 'member' : 'members'}`}
          />
          <SettingsRow variant="clickable" icon={CaretLargeRightIcon} label="Billing" description="Payments and invoices" />
        </SettingsCard>
      </ContentSection>

      {team.role !== 'member' && (
        <ContentSection label="Workspace access">
          <SettingsCard>
            <SettingsRow variant="clickable" icon={CaretLargeRightIcon} label="Delete workspace" />
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
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt="" className="member-avatar-img" />
          ) : (
            <span className="member-avatar">
              <Text as="span" variant="text-xsmall" weight="semibold" style={{ color: '#fff' }}>{member.avatarInitials}</Text>
            </span>
          )}
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
        const byYou = invite.sentBy === 'Morgan Taylor'
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

function SignOutTab() {
  const products = [
    { name: 'Superhuman', email: 'morgan@taylor.com' },
    { name: 'Coda', email: 'morgan@taylor.com' },
    { name: 'Grammarly', email: 'morgan@taylor.com' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
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

function GeneralTab({ orgName, onOrgNameChange }: { orgName: string; onOrgNameChange: (name: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <PageTitle title="General" />
      <SettingsCard>
        <SettingsRow
          variant="action"
          label="Organization name"
          actions={
            <div className="settings-field-compact">
              <TextField
                label="Organization name"
                labelDisplay="hidden"
                value={orgName}
                onChange={onOrgNameChange}
                size="medium"
              />
            </div>
          }
        />
      </SettingsCard>
    </div>
  )
}

function OrgMembersTab({ org }: { org: Team }) {
  const members = (DEMO_MEMBERS[org.id] ?? []).filter(m => m.status === 'active')
  const invites = DEMO_INVITES[org.id] ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <PageTitle title="Members" />
        <Button text="Invite" variant="secondary" size="small" iconStart={PlusIcon} />
      </div>
      <MemberList members={members} isAdmin />
      {invites.length > 0 && (
        <ContentSection label="Pending invites">
          <InviteList invites={invites} />
        </ContentSection>
      )}
    </div>
  )
}

function SubscriptionTab({ org }: { org: Team }) {
  const isFree = org.planLabel === 'Free'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <PageTitle title="Subscription" />
      <SettingsCard>
        <SettingsRow
          variant="action"
          label={isFree ? 'Free plan' : org.planLabel}
          description={isFree ? 'Upgrade to access premium features across all products' : 'Manage your subscription and billing'}
          external
          actions={<Button text={isFree ? 'Upgrade' : 'Manage'} variant="secondary" size="small" />}
        />
      </SettingsCard>
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

function SettingsContent({ teams }: {
  teams: Team[]
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('preferences')
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

  const org = teams[0] ?? null
  const isOrgAdmin = org?.role === 'admin'
  const [orgName, setOrgName] = useState(org?.name ?? '')

  useEffect(() => {
    if (org) setActiveTeamId(org.id)
    // If not an admin and on an admin tab, redirect to profile
    if (!isOrgAdmin && ['general', 'members', 'subscription'].includes(activeTab)) {
      setActiveTab('profile')
    }
  }, [teams])

  const settingsItems: { id: SettingsTab; label: string; icon: typeof UserIcon }[] = [
    { id: 'preferences', label: 'Preferences', icon: SlidersIcon },
  ]

  const accountItems: { id: SettingsTab; label: string; icon: typeof UserIcon }[] = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: LockIcon },
    { id: 'connected', label: 'Connected accounts', icon: LinkIcon },
    { id: 'data-privacy', label: 'Data & privacy', icon: EyeIcon },
  ]

  const orgItems: { id: SettingsTab; label: string; icon: typeof UserIcon }[] = [
    { id: 'general', label: 'General', icon: BuildingIcon },
    { id: 'members', label: 'Members', icon: UsersIcon },
    { id: 'subscription', label: 'Subscription', icon: StarIcon },
  ]

  const backToTabs = () => {
    setView('tabs')
    setShowToast(false)
  }

  const makeNavItems = (items: { id: SettingsTab; label: string; icon: typeof UserIcon }[]) =>
    items.map(item => (
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
          <Menu.Section label="Settings">{makeNavItems(settingsItems)}</Menu.Section>
          <Menu.Section label="Account">{makeNavItems(accountItems)}</Menu.Section>
          {isOrgAdmin && org && (
            <Menu.Section label={orgName}>{makeNavItems(orgItems)}</Menu.Section>
          )}
          <Menu.Section label="Apps">
            <Menu.Item key="coda" href="https://coda.io" target="_blank">Coda <Text as="span" variant="text-xsmall" color="base-subdued">↗</Text></Menu.Item>
            <Menu.Item key="grammarly" href="https://grammarly.com" target="_blank">Grammarly <Text as="span" variant="text-xsmall" color="base-subdued">↗</Text></Menu.Item>
            <Menu.Item key="mail" href="https://mail.superhuman.com" target="_blank">Mail <Text as="span" variant="text-xsmall" color="base-subdued">↗</Text></Menu.Item>
          </Menu.Section>
        </ul>
        <div style={{ marginTop: 'auto', padding: 'var(--space-3) var(--space-2)' }}>
          <Text as="p" variant="text-xsmall" color="base-subdued">Go v1.0</Text>
        </div>
      </nav>

      <div ref={contentRef} className={`settings-content${fading ? ' settings-content-fading' : ''}`} style={{ flex: 1, minWidth: 0 }}>
        {renderedView === 'tabs' && renderedTab === 'profile' && <ProfileSettings onCloseAccount={() => setView('close-account')} teams={teams} />}
        {renderedView === 'tabs' && renderedTab === 'preferences' && <PreferencesTab />}
        {renderedView === 'tabs' && renderedTab === 'security' && <SecurityTab />}
        {renderedView === 'tabs' && renderedTab === 'connected' && <ConnectedAccountsTab />}
        {renderedView === 'tabs' && renderedTab === 'data-privacy' && <DataPrivacyTab />}
        {renderedView === 'tabs' && renderedTab === 'general' && org && <GeneralTab orgName={orgName} onOrgNameChange={setOrgName} />}
        {renderedView === 'tabs' && renderedTab === 'members' && org && <OrgMembersTab org={org} />}
        {renderedView === 'tabs' && renderedTab === 'subscription' && org && <SubscriptionTab org={org} />}
        {renderedView === 'tabs' && isScrollable && <EndOfContent />}

        {renderedView === 'close-account' && (
          <CloseAccount onBack={backToTabs} teams={teams} />
        )}
      </div>

      {showToast && (
        <div style={{ position: 'absolute', bottom: 'var(--space-6)', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Toast
            text="Deletion verification code sent to morgan@taylor.com"
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
      case 'close-account': return <CloseAccount onBack={() => { window.location.href = urlWithPlan('account', plan, '&section=profile') }} teams={teams} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
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
      <SettingsContent teams={teams} />
    </div>
  )
}

// ── Demo accounts ──

const DEMO_ACCOUNTS: { email: string; plan: Plan; planLabel: string }[] = [
  { email: 'morgan@gmail.com', plan: 'free', planLabel: 'Free' },
  { email: 'morgan@taylor.com', plan: 'pro', planLabel: 'Pro' },
  { email: 'morgan@acme.com', plan: 'enterprise', planLabel: 'Enterprise' },
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
              <img src="/img/avatar.png" alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
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
  const [exportToast, setExportToast] = useState(false)
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
      } else if (e.data?.type === 'export-requested') {
        setExportToast(true)
        setTimeout(() => setExportToast(false), 5000)
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'transparent', borderBottom: 'none', flexShrink: 0 }}>
        <Logo brand="superhuman" composition="lockup" variant="color-secondary" accessibilityLabel="Superhuman" style={{ transform: 'scale(0.75)', transformOrigin: 'left center' }} />
        {isSignedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <IconButton icon={BellIcon} variant="tertiary" size="medium" accessibilityLabel="Notifications" />
          <div className="profile-menu-button-wrapper">
            <Menu
              activator={
                <IconButton icon={UserIcon} variant="tertiary" size="medium" accessibilityLabel="Profile menu" />
              }
              accessibilityLabel="Profile menu"
            >
              <div className="profile-menu-user-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 }}>
                  <img src="/img/avatar.png" alt="" className="profile-menu-card-avatar" />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Text as="p" variant="text-small" weight="medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Morgan Taylor</Text>
                    <Text as="p" variant="text-small" color="base-subdued" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>morgan@taylor.com</Text>
                  </div>
                </div>
                <div style={{ alignSelf: 'flex-start' }}>
                  <PlanTag variant={plan} size="xsmall" title={plan} />
                </div>
              </div>
              <Menu.Item key="settings" icon={GearIcon} onClick={() => setSettingsOpen(true)}>Settings</Menu.Item>
              <div className="profile-menu-divider" />
              <Menu.Item key="signout" icon={ArrowRightRectangleIcon} onClick={handleSignOut}>Sign out</Menu.Item>
            </Menu>
          </div>
          </div>
        ) : (
          <IconButton icon={UserIcon} variant="tertiary" size="medium" accessibilityLabel="Sign in" onClick={() => setSignInOpen(true)} />
        )}
      </nav>

      <div style={{ flex: 1, padding: '0 var(--space-3) var(--space-3)' }}>
        <div style={{
          backgroundColor: 'var(--color-background-base-default)',
          border: '1px solid var(--color-border-base-subdued)',
          borderRadius: 'var(--radius-medium)',
          height: '100%',
        }} />
      </div>

      {/* Iframe overlay for settings */}
      {settingsOpen && (
        <div className="settings-iframe-overlay" onClick={() => setSettingsOpen(false)}>
          <iframe
            className="settings-iframe"
            src={urlWithPlan('settings', plan)}
            onClick={(e) => e.stopPropagation()}
          />
          {exportToast && (
            <div style={{ position: 'fixed', bottom: 'var(--space-6)', right: 'var(--space-6)', zIndex: 1001 }}>
              <Toast text="Export requested — we'll email you when it's ready" onClose={() => setExportToast(false)} />
            </div>
          )}
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

    </div>
  )
}

// ── components.localhost — component reference ──

function ComponentsPage() {
  const [toggleOn, setToggleOn] = useState(false)

  return (
    <div className="standalone-page">
      <div className="standalone-page-inner" style={{ maxWidth: 520, gap: 'var(--space-12)' }}>
        {/* ── Page header ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <Text as="p" variant="text-xsmall" color="base-subdued" weight="medium">Page header</Text>
          <PageTitle title="Title" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <PageTitle title="Title" />
            <Button text="Action" variant="secondary" size="small" />
          </div>
        </div>

        {/* ── Group header ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <Text as="p" variant="text-xsmall" color="base-subdued" weight="medium">Group header</Text>
          <ContentSection label="Header" />
          <ContentSection label="Header" description="Description" />
        </div>

        {/* ── Setting ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <Text as="p" variant="text-xsmall" color="base-subdued" weight="medium">Setting</Text>
          <SettingsCard>
            <SettingsRow variant="clickable" label="Label" description="Description" value="Value" icon={CaretLargeRightIcon} />
          </SettingsCard>
          <SettingsCard>
            <SettingsRow variant="action" label="Label" description="Description" actions={<Button text="Action" variant="secondary" size="small" />} overflowActions={[{ label: 'Action 2' }, { label: 'Action 3' }]} />
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
          <SettingsCard>
            <SettingsRow variant="action" label="Label" description="Description" external actions={<Button text="Action" variant="secondary" size="small" />} />
          </SettingsCard>
          <SettingsCard>
            <SettingsRow variant="action" label="Label" actions={
              <div className="settings-field-compact">
                <TextField label="Label" labelDisplay="hidden" value="Value" onChange={() => {}} size="medium" />
              </div>
            } />
          </SettingsCard>
        </div>

        {/* ── Settings group ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <Text as="p" variant="text-xsmall" color="base-subdued" weight="medium">Settings group</Text>
          <ContentSection label="Header">
            <SettingsCard>
              <SettingsRow variant="clickable" label="Label" description="Description" icon={CaretLargeRightIcon} />
              <SettingsRow variant="action" label="Label" description="Description" actions={<Button text="Action" variant="secondary" size="small" />} />
              <SettingsRow variant="action" label="Label" description="Description" actions={<Switch label="Toggle" labelDisplay="hidden" />} />
            </SettingsCard>
          </ContentSection>
        </div>

        {/* ── Settings page ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          <Text as="p" variant="text-xsmall" color="base-subdued" weight="medium">Settings page</Text>
          <PageTitle title="Title" />
          <SettingsCard>
            <SettingsRow variant="clickable" label="Label" description="Description" icon={CaretLargeRightIcon} />
            <SettingsRow variant="action" label="Label" description="Description" actions={<Button text="Action" variant="secondary" size="small" />} />
            <SettingsRow variant="action" label="Label" description="Description" actions={<Switch label="Toggle" labelDisplay="hidden" />} />
          </SettingsCard>
          <ContentSection label="Header" description="Description">
            <SettingsCard>
              <SettingsRow variant="clickable" label="Label" description="Description" icon={CaretLargeRightIcon} />
              <SettingsRow variant="action" label="Label" description="Description" actions={<Button text="Action" variant="secondary" size="small" />} />
              <SettingsRow variant="action" label="Label" description="Description" actions={<Switch label="Toggle" labelDisplay="hidden" />} />
            </SettingsCard>
          </ContentSection>
          <ContentSection label="Header" description="Description">
            <SettingsCard>
              <SettingsRow variant="clickable" label="Label" description="Description" icon={CaretLargeRightIcon} />
              <SettingsRow variant="action" label="Label" description="Description" actions={<Button text="Action" variant="secondary" size="small" />} />
              <SettingsRow variant="action" label="Label" description="Description" actions={<Switch label="Toggle" labelDisplay="hidden" />} />
            </SettingsCard>
          </ContentSection>
        </div>
      </div>
    </div>
  )
}

// ── App — subdomain router ──

function App() {
  const subdomain = getRoute()
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
