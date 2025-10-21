export interface Command {
  id: string;
  name: string;
  syntax: string;
  description: string;
  category: string;
  examples: string[];
  tags: string[];
}

export const commands: Command[] = [
  {
    id: "ls",
    name: "ls",
    syntax: "ls -lah",
    description: "List directory contents with detailed information, including hidden files and human-readable sizes. Essential for navigating and inspecting file systems.",
    category: "File Operations",
    examples: ["ls -la", "ls -lh /var/log", "ls -lt | head -10"],
    tags: ["list", "directory", "files", "view"]
  },
  {
    id: "grep",
    name: "grep",
    syntax: "grep -r 'pattern' /path/to/search",
    description: "Search for patterns in files recursively. One of the most powerful tools for finding text across files and logs. Supports regular expressions for complex pattern matching.",
    category: "Text Processing",
    examples: ["grep -i 'error' /var/log/syslog", "grep -r 'TODO' .", "grep -v '^#' config.file"],
    tags: ["search", "find", "text", "pattern", "regex"]
  },
  {
    id: "find",
    name: "find",
    syntax: "find /path -name 'filename' -type f",
    description: "Search for files and directories in a directory hierarchy. Extremely versatile with many options for filtering by name, size, time, permissions, and more.",
    category: "File Operations",
    examples: ["find . -name '*.log'", "find /var -size +100M", "find . -mtime -7"],
    tags: ["search", "files", "locate"]
  },
  {
    id: "ps",
    name: "ps",
    syntax: "ps aux",
    description: "Display information about running processes. Shows all processes with detailed information including user, CPU usage, memory usage, and command.",
    category: "Process Management",
    examples: ["ps aux | grep nginx", "ps -ef", "ps aux --sort=-%mem | head"],
    tags: ["process", "running", "system", "monitor"]
  },
  {
    id: "top",
    name: "top",
    syntax: "top -o %CPU",
    description: "Display and update sorted information about running processes. Provides a dynamic real-time view of system performance and resource usage.",
    category: "System Monitoring",
    examples: ["top", "top -u username", "top -p PID"],
    tags: ["monitor", "cpu", "memory", "performance", "real-time"]
  },
  {
    id: "htop",
    name: "htop",
    syntax: "htop",
    description: "Interactive process viewer and system monitor. More user-friendly than top with color-coded display, mouse support, and easier process management.",
    category: "System Monitoring",
    examples: ["htop", "htop -u username", "htop -p PID"],
    tags: ["monitor", "cpu", "memory", "performance", "interactive"]
  },
  {
    id: "netstat",
    name: "netstat",
    syntax: "netstat -tulpn",
    description: "Display network connections, routing tables, and network statistics. Shows TCP/UDP listening ports with process information.",
    category: "Network",
    examples: ["netstat -an", "netstat -r", "netstat -i"],
    tags: ["network", "connections", "ports", "tcp", "udp"]
  },
  {
    id: "ss",
    name: "ss",
    syntax: "ss -tulpn",
    description: "Socket statistics utility - modern replacement for netstat. Displays TCP/UDP sockets, listening ports, and established connections with process details.",
    category: "Network",
    examples: ["ss -t", "ss -a", "ss -s"],
    tags: ["network", "sockets", "connections", "tcp", "udp"]
  },
  {
    id: "tcpdump",
    name: "tcpdump",
    syntax: "tcpdump -i eth0 -n port 80",
    description: "Capture and analyze network packets. Essential tool for network troubleshooting and security analysis. Displays detailed packet information in real-time.",
    category: "Network",
    examples: ["tcpdump -i any", "tcpdump host 192.168.1.1", "tcpdump -w capture.pcap"],
    tags: ["network", "packets", "capture", "tcp", "troubleshoot", "sniff"]
  },
  {
    id: "iptables",
    name: "iptables",
    syntax: "iptables -L -n -v",
    description: "Display firewall rules with verbose output. Shows packet and byte counters for each rule. Critical for security auditing and firewall management.",
    category: "Security",
    examples: ["iptables -L INPUT", "iptables -S", "iptables -t nat -L"],
    tags: ["firewall", "security", "rules", "network"]
  },
  {
    id: "chmod",
    name: "chmod",
    syntax: "chmod 755 filename",
    description: "Change file permissions. 755 gives owner full permissions (rwx), group and others read and execute (r-x). Essential for security and access control.",
    category: "File Operations",
    examples: ["chmod +x script.sh", "chmod -R 644 /var/www", "chmod u+w file"],
    tags: ["permissions", "security", "access", "files"]
  },
  {
    id: "chown",
    name: "chown",
    syntax: "chown user:group filename",
    description: "Change file owner and group. Used to assign ownership of files and directories to specific users and groups.",
    category: "File Operations",
    examples: ["chown -R www-data:www-data /var/www", "chown user file", "chown :group file"],
    tags: ["ownership", "user", "group", "permissions"]
  },
  {
    id: "df",
    name: "df",
    syntax: "df -h",
    description: "Display disk space usage in human-readable format. Shows filesystem size, used space, available space, and mount points.",
    category: "Disk Management",
    examples: ["df -h", "df -i", "df -T"],
    tags: ["disk", "space", "filesystem", "storage"]
  },
  {
    id: "du",
    name: "du",
    syntax: "du -sh /path/to/directory",
    description: "Display disk usage of files and directories. Shows total size in human-readable format. Use to identify large files and directories.",
    category: "Disk Management",
    examples: ["du -h --max-depth=1", "du -ah | sort -h", "du -csh *"],
    tags: ["disk", "usage", "size", "storage"]
  },
  {
    id: "tar",
    name: "tar",
    syntax: "tar -czf archive.tar.gz /path/to/directory",
    description: "Create compressed archive. Commonly used for backups and file distribution. Combines multiple files into a single archive with gzip compression.",
    category: "Archive",
    examples: ["tar -xzf archive.tar.gz", "tar -czf backup.tar.gz /etc", "tar -tf archive.tar"],
    tags: ["compress", "archive", "backup", "extract"]
  },
  {
    id: "systemctl",
    name: "systemctl",
    syntax: "systemctl status service-name",
    description: "Control and query systemd system and service manager. Check service status, start, stop, restart, and enable services at boot.",
    category: "System Management",
    examples: ["systemctl restart nginx", "systemctl enable apache2", "systemctl list-units"],
    tags: ["service", "systemd", "daemon", "startup"]
  },
  {
    id: "journalctl",
    name: "journalctl",
    syntax: "journalctl -u service-name -f",
    description: "Query and display systemd journal logs for a specific service with real-time following. Essential for troubleshooting service issues.",
    category: "Logs",
    examples: ["journalctl -xe", "journalctl --since today", "journalctl -p err"],
    tags: ["logs", "systemd", "journal", "debug"]
  },
  {
    id: "tail",
    name: "tail",
    syntax: "tail -f /var/log/syslog",
    description: "Display and follow the end of a file in real-time. Indispensable for monitoring log files and watching for new entries as they occur.",
    category: "Logs",
    examples: ["tail -n 100 file.log", "tail -f access.log", "tail -n +10 file"],
    tags: ["logs", "monitor", "follow", "watch"]
  },
  {
    id: "less",
    name: "less",
    syntax: "less +F /var/log/syslog",
    description: "View file contents with scrolling and search capabilities. +F option follows the file like 'tail -f' but allows scrolling back.",
    category: "Text Processing",
    examples: ["less file.txt", "less +G file.txt", "command | less"],
    tags: ["view", "pager", "scroll", "read"]
  },
  {
    id: "sed",
    name: "sed",
    syntax: "sed -i 's/old/new/g' filename",
    description: "Stream editor for filtering and transforming text. Performs in-place substitution of all occurrences of 'old' with 'new'.",
    category: "Text Processing",
    examples: ["sed 's/^/# /' file", "sed -n '10,20p' file", "sed '/pattern/d' file"],
    tags: ["edit", "replace", "text", "substitute"]
  },
  {
    id: "awk",
    name: "awk",
    syntax: "awk '{print $1}' filename",
    description: "Pattern scanning and text processing language. Extract and print the first column of each line. Powerful for data extraction and reporting.",
    category: "Text Processing",
    examples: ["awk -F: '{print $1}' /etc/passwd", "awk '$3 > 100' data", "df | awk 'NR>1 {print $5}'"],
    tags: ["text", "columns", "extract", "process"]
  },
  {
    id: "curl",
    name: "curl",
    syntax: "curl -X GET https://api.example.com",
    description: "Transfer data from or to a server. Supports HTTP, HTTPS, FTP, and many protocols. Essential for API testing and web debugging.",
    category: "Network",
    examples: ["curl -I https://example.com", "curl -o file.zip https://url", "curl -H 'Content-Type: application/json' -d '{}'"],
    tags: ["http", "api", "download", "web", "request"]
  },
  {
    id: "wget",
    name: "wget",
    syntax: "wget https://example.com/file.zip",
    description: "Download files from the web. Supports resuming interrupted downloads and recursive downloads. More focused on downloading than curl.",
    category: "Network",
    examples: ["wget -c url", "wget -r -np url", "wget -q -O- url"],
    tags: ["download", "http", "web", "fetch"]
  },
  {
    id: "ssh",
    name: "ssh",
    syntax: "ssh user@hostname",
    description: "Secure shell - connect to remote servers securely. The standard way to access and manage remote Linux systems.",
    category: "Network",
    examples: ["ssh -p 2222 user@host", "ssh -i key.pem user@host", "ssh -L 8080:localhost:80 user@host"],
    tags: ["remote", "secure", "login", "connection"]
  },
  {
    id: "scp",
    name: "scp",
    syntax: "scp file.txt user@hostname:/path/to/destination",
    description: "Securely copy files between hosts over SSH. Supports copying files to and from remote servers with encryption.",
    category: "Network",
    examples: ["scp user@host:/path/file .", "scp -r directory user@host:/path", "scp -P 2222 file user@host:"],
    tags: ["copy", "transfer", "secure", "remote", "ssh"]
  },
  {
    id: "rsync",
    name: "rsync",
    syntax: "rsync -avz /source user@hostname:/destination",
    description: "Sync files and directories efficiently between locations. Only transfers differences, preserves permissions, and shows progress. Better than cp for large transfers.",
    category: "File Operations",
    examples: ["rsync -avz --delete src/ dst/", "rsync -avz -e ssh src/ user@host:dst/", "rsync -av --progress src dst"],
    tags: ["sync", "copy", "backup", "transfer", "remote"]
  },
  {
    id: "docker-ps",
    name: "docker ps",
    syntax: "docker ps -a",
    description: "List all Docker containers including stopped ones. Shows container ID, image, command, status, ports, and names.",
    category: "Containers",
    examples: ["docker ps", "docker ps -q", "docker ps --filter 'status=running'"],
    tags: ["docker", "containers", "list", "running"]
  },
  {
    id: "docker-logs",
    name: "docker logs",
    syntax: "docker logs -f container-name",
    description: "Display and follow logs from a Docker container in real-time. Essential for debugging containerized applications.",
    category: "Containers",
    examples: ["docker logs container-id", "docker logs --tail 100 container", "docker logs --since 1h container"],
    tags: ["docker", "logs", "containers", "debug"]
  },
  {
    id: "kubectl-get",
    name: "kubectl get",
    syntax: "kubectl get pods -n namespace",
    description: "Display Kubernetes pods in a specific namespace. Shows pod name, ready status, restarts, and age.",
    category: "Kubernetes",
    examples: ["kubectl get pods -A", "kubectl get deployments", "kubectl get services"],
    tags: ["kubernetes", "k8s", "pods", "cluster"]
  },
  {
    id: "kubectl-logs",
    name: "kubectl logs",
    syntax: "kubectl logs -f pod-name -n namespace",
    description: "Display and follow logs from a Kubernetes pod. Use -c to specify container in multi-container pods.",
    category: "Kubernetes",
    examples: ["kubectl logs pod-name", "kubectl logs -f pod-name -c container", "kubectl logs --previous pod-name"],
    tags: ["kubernetes", "k8s", "logs", "debug", "pods"]
  },
  {
    id: "free",
    name: "free",
    syntax: "free -h",
    description: "Display memory usage in human-readable format. Shows total, used, free, shared, buffer/cache, and available memory.",
    category: "System Monitoring",
    examples: ["free -m", "free -g", "free -h -s 5"],
    tags: ["memory", "ram", "usage", "system"]
  },
  {
    id: "vmstat",
    name: "vmstat",
    syntax: "vmstat 1 10",
    description: "Report virtual memory statistics every 1 second for 10 iterations. Shows processes, memory, swap, I/O, system, and CPU activity.",
    category: "System Monitoring",
    examples: ["vmstat", "vmstat -s", "vmstat -d"],
    tags: ["memory", "performance", "system", "statistics"]
  },
  {
    id: "iostat",
    name: "iostat",
    syntax: "iostat -x 1",
    description: "Display extended I/O statistics every second. Shows CPU utilization and device I/O statistics including throughput and latency.",
    category: "System Monitoring",
    examples: ["iostat", "iostat -d", "iostat -c"],
    tags: ["io", "disk", "performance", "statistics"]
  },
  {
    id: "lsof",
    name: "lsof",
    syntax: "lsof -i :80",
    description: "List open files and processes using port 80. Useful for finding which process is using a specific port or file.",
    category: "System Monitoring",
    examples: ["lsof -u username", "lsof /var/log/syslog", "lsof -i tcp"],
    tags: ["files", "ports", "process", "network", "open"]
  },
  {
    id: "nc",
    name: "nc",
    syntax: "nc -zv hostname 1-1000",
    description: "Network cat - scan ports 1-1000 on a host verbosely. Versatile networking utility for port scanning, file transfer, and connection testing.",
    category: "Network",
    examples: ["nc -l 8080", "nc hostname 80", "nc -u hostname 53"],
    tags: ["network", "netcat", "port", "scan", "tcp", "udp"]
  },
  {
    id: "ping",
    name: "ping",
    syntax: "ping -c 4 hostname",
    description: "Send 4 ICMP echo requests to test network connectivity. Shows round-trip time and packet loss percentage.",
    category: "Network",
    examples: ["ping google.com", "ping -i 2 host", "ping -s 1000 host"],
    tags: ["network", "connectivity", "icmp", "test"]
  },
  {
    id: "traceroute",
    name: "traceroute",
    syntax: "traceroute hostname",
    description: "Trace the network path packets take to reach a destination. Shows all intermediate hops and their response times.",
    category: "Network",
    examples: ["traceroute -n host", "traceroute -I host", "traceroute -m 20 host"],
    tags: ["network", "route", "path", "hops", "trace"]
  },
  {
    id: "nmap",
    name: "nmap",
    syntax: "nmap -sV -p- hostname",
    description: "Network mapper - scan all ports and detect service versions on a host. Powerful security scanning and network discovery tool.",
    category: "Security",
    examples: ["nmap -sn 192.168.1.0/24", "nmap -A hostname", "nmap -sS -p 80,443 host"],
    tags: ["network", "scan", "ports", "security", "discovery"]
  },
  {
    id: "cron",
    name: "crontab",
    syntax: "crontab -e",
    description: "Edit cron jobs for scheduled task automation. Opens the cron table in your default editor to add, modify, or remove scheduled commands.",
    category: "System Management",
    examples: ["crontab -l", "crontab -r", "crontab -u username -l"],
    tags: ["schedule", "automation", "cron", "jobs", "tasks"]
  },
  {
    id: "at",
    name: "at",
    syntax: "at now + 1 hour",
    description: "Schedule a one-time command execution. Unlike cron, at is for single-run scheduled tasks.",
    category: "System Management",
    examples: ["at 10:00 AM", "at tomorrow", "atq"],
    tags: ["schedule", "task", "delayed", "jobs"]
  },
  {
    id: "kill",
    name: "kill",
    syntax: "kill -9 PID",
    description: "Force kill a process by PID. Signal 9 (SIGKILL) forcefully terminates the process without cleanup. Use with caution.",
    category: "Process Management",
    examples: ["kill PID", "kill -15 PID", "killall process-name"],
    tags: ["process", "terminate", "signal", "stop"]
  },
  {
    id: "pkill",
    name: "pkill",
    syntax: "pkill -f 'pattern'",
    description: "Kill processes matching a pattern. More convenient than finding PIDs manually with ps and kill.",
    category: "Process Management",
    examples: ["pkill process-name", "pkill -u username", "pkill -9 process"],
    tags: ["process", "kill", "pattern", "terminate"]
  },
  {
    id: "nohup",
    name: "nohup",
    syntax: "nohup command &",
    description: "Run command immune to hangups, in the background. Output is redirected to nohup.out. Useful for long-running processes over SSH.",
    category: "Process Management",
    examples: ["nohup ./script.sh &", "nohup command > output.log 2>&1 &"],
    tags: ["background", "process", "persistent", "detach"]
  },
  {
    id: "screen",
    name: "screen",
    syntax: "screen -S session-name",
    description: "Create a named screen session. Allows detaching and reattaching to terminal sessions, useful for persistent remote work.",
    category: "System Management",
    examples: ["screen -r session-name", "screen -ls", "screen -d -r"],
    tags: ["terminal", "session", "persistent", "detach"]
  },
  {
    id: "tmux",
    name: "tmux",
    syntax: "tmux new -s session-name",
    description: "Create a new tmux session. Modern alternative to screen with split panes and better functionality for managing terminal sessions.",
    category: "System Management",
    examples: ["tmux attach -t session", "tmux ls", "tmux kill-session -t session"],
    tags: ["terminal", "session", "multiplexer", "split"]
  },
  {
    id: "mount",
    name: "mount",
    syntax: "mount /dev/sdb1 /mnt/usb",
    description: "Mount a filesystem or device. Makes the filesystem accessible at the specified mount point.",
    category: "Disk Management",
    examples: ["mount -a", "mount -t nfs server:/share /mnt", "mount -o remount,rw /"],
    tags: ["filesystem", "device", "disk", "attach"]
  },
  {
    id: "umount",
    name: "umount",
    syntax: "umount /mnt/usb",
    description: "Unmount a filesystem. Safely detaches the filesystem, flushing all pending writes to disk.",
    category: "Disk Management",
    examples: ["umount -f /mnt", "umount -l /mnt"],
    tags: ["filesystem", "device", "disk", "detach", "unmount"]
  },
  {
    id: "fdisk",
    name: "fdisk",
    syntax: "fdisk -l",
    description: "List all disk partitions with detailed information. Shows partition table, sizes, types, and device names.",
    category: "Disk Management",
    examples: ["fdisk /dev/sda", "fdisk -l /dev/sdb"],
    tags: ["disk", "partition", "storage", "device"]
  },
  {
    id: "dmesg",
    name: "dmesg",
    syntax: "dmesg | tail -n 50",
    description: "Display the last 50 kernel ring buffer messages. Essential for debugging hardware issues and boot problems.",
    category: "System Monitoring",
    examples: ["dmesg -T", "dmesg -w", "dmesg | grep -i error"],
    tags: ["kernel", "logs", "boot", "hardware", "debug"]
  },
  {
    id: "uname",
    name: "uname",
    syntax: "uname -a",
    description: "Display all system information including kernel name, version, machine hardware, and operating system.",
    category: "System Info",
    examples: ["uname -r", "uname -m", "uname -s"],
    tags: ["system", "kernel", "version", "info"]
  },
  {
    id: "uptime",
    name: "uptime",
    syntax: "uptime",
    description: "Show how long the system has been running, number of users, and system load averages for 1, 5, and 15 minutes.",
    category: "System Info",
    examples: ["uptime -p", "uptime -s"],
    tags: ["system", "load", "running", "time"]
  },
  {
    id: "who",
    name: "who",
    syntax: "who",
    description: "Display who is logged in to the system. Shows username, terminal, login time, and remote host.",
    category: "System Info",
    examples: ["who -b", "who -r", "who -q"],
    tags: ["users", "logged", "session", "login"]
  },
  {
    id: "w",
    name: "w",
    syntax: "w",
    description: "Show who is logged in and what they are doing. Displays uptime, load average, and process information for each user.",
    category: "System Info",
    examples: ["w username", "w -s"],
    tags: ["users", "logged", "process", "activity"]
  }
];
