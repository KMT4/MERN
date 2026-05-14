import { Bell, AlertTriangle, Info, CheckCircle, TrendingUp } from 'lucide-react';

export function Notifications() {
  const notifications = [
    {
      id: 1,
      type: 'alert',
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      title: 'Budget Limit Exceeded',
      message: 'Your Food budget has exceeded the limit by $50 this month.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      type: 'alert',
      icon: AlertTriangle,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
      title: 'Unusual Spending Detected',
      message: 'Entertainment spending is 45% higher than your average.',
      time: '5 hours ago',
      unread: true
    },
    {
      id: 3,
      type: 'success',
      icon: CheckCircle,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      title: 'Savings Goal Milestone',
      message: 'You\'ve reached 80% of your Emergency Fund goal!',
      time: '1 day ago',
      unread: false
    },
    {
      id: 4,
      type: 'info',
      icon: Info,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
      title: 'Upcoming Payment Due',
      message: 'Your rent payment of $1,200 is due on May 15, 2026.',
      time: '1 day ago',
      unread: false
    },
    {
      id: 5,
      type: 'success',
      icon: TrendingUp,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      title: 'Income Received',
      message: 'Salary deposit of $5,800 has been recorded.',
      time: '2 days ago',
      unread: false
    },
    {
      id: 6,
      type: 'info',
      icon: Bell,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
      title: 'Monthly Report Ready',
      message: 'Your April financial report is now available.',
      time: '3 days ago',
      unread: false
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-1">Notifications</h2>
          <p className="text-muted-foreground">Stay updated on your finances</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {unreadCount} unread
          </span>
          <button className="text-primary hover:underline text-sm">
            Mark all as read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Alert Notifications</span>
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">2</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Info Notifications</span>
            <Info className="w-5 h-5 text-chart-3" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">2</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Success Notifications</span>
            <CheckCircle className="w-5 h-5 text-chart-2" />
          </div>
          <div className="text-2xl font-semibold text-card-foreground">2</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-card-foreground mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { label: 'Budget limit alerts', enabled: true },
            { label: 'Unusual spending notifications', enabled: true },
            { label: 'Savings milestone updates', enabled: true },
            { label: 'Upcoming payment reminders', enabled: true },
            { label: 'Income deposit notifications', enabled: false },
            { label: 'Monthly report summaries', enabled: true },
            { label: 'AI insights and recommendations', enabled: true },
          ].map((pref, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <span className="text-card-foreground">{pref.label}</span>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked={pref.enabled}
                />
                <div className="w-12 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors cursor-pointer"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`bg-card border rounded-lg p-4 ${notification.unread ? 'border-primary' : 'border-border'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.bgColor}`}>
                  <Icon className={`w-5 h-5 ${notification.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-card-foreground font-medium">{notification.title}</h4>
                    {notification.unread && (
                      <span className="w-2 h-2 bg-primary rounded-full mt-1.5"></span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
