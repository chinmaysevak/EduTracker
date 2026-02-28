# EduTrack - Student Assistant

A modern, feature-rich student management application built with React, TypeScript, and Tailwind CSS. EduTrack helps students organize their academic life with attendance tracking, study materials, task management, and progress monitoring.

## 🚀 Features

### 📊 **Dashboard**
- Weekly schedule overview with visual calendar
- Real-time clock and date display
- Quick access to all modules
- Daily motivational quotes

### 📚 **Attendance Management**
- Track attendance for multiple subjects
- Visual attendance statistics
- Subject-wise attendance reports
- Smart notifications for low attendance

### 📁 **Study Materials**
- Organize study materials by subject
- Support for various file types
- Quick search and filtering
- Material categorization

### 🎓 **Learning Hub**
- YouTube playlist integration
- Educational resource management
- Subject-specific learning materials
- Progress tracking

### 📅 **Planner & Tasks**
- Task creation and management
- Deadline tracking
- Priority-based organization
- Task completion analytics

### 📈 **Progress Tracking**
- Visual progress charts
- Subject-wise performance metrics
- Goal setting and tracking
- Achievement badges

### ⚙️ **Settings**
- Import/Export functionality
- Data backup and restore
- Theme customization (Light/Dark)
- Profile management

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Hooks + LocalStorage
- **Notifications**: Sonner

## 📱 Responsive Design

EduTrack is fully responsive and optimized for:
- Desktop (1920x1080 and above)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)
- Special optimization for Pixel 7 and similar devices

## 🎨 UI/UX Features

- **Glass Morphism Design**: Modern glass effects with backdrop blur
- **Smooth Animations**: 300ms transitions throughout
- **Dark/Light Theme**: System preference detection
- **Collapsible Sidebar**: Space-efficient navigation
- **Custom Scrollbars**: Invisible scrollbars with hover effects
- **Professional Icons**: Consistent iconography

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/chinmaysevak/EduTracker0.git
   cd edutrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
EduTracker0/
├── public/                 # Static assets
│   ├── favicon.svg         # Favicon
│   └── logo.svg          # App logo
├── src/
│   ├── components/         # Reusable UI components
│   ├── sections/          # Main app sections
│   │   ├── Dashboard.tsx
│   │   ├── Attendance.tsx
│   │   ├── Materials.tsx
│   │   ├── LearningHub.tsx
│   │   ├── Planner.tsx
│   │   ├── Progress.tsx
│   │   └── Settings.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useData.ts
│   │   ├── useImportExport.ts
│   │   └── useLocalStorage.ts
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 💾 Data Storage

EduTrack uses browser localStorage for data persistence:

- `edu-tracker-subjects` - Subject information
- `edu-tracker-attendance-v2` - Attendance records
- `edu-tracker-materials` - Study materials
- `edu-tracker-playlists` - YouTube playlists
- `edu-tracker-tasks` - Study tasks
- `edu-tracker-progress` - Progress data
- `edu-tracker-notifications` - Notification settings
- `edu-tracker-timetable-data` - Timetable information
- `edu-tracker-timetable-times` - Custom time slots
- `edu-tracker-user-name` - User profile
- `edu-tracker-authenticated` - Authentication state

## 🔄 Import/Export

EduTrack supports full data backup and restore:

1. **Export Data**: Settings → Export Data → Download JSON file
2. **Import Data**: Settings → Import Data → Select JSON file
3. **Clear Data**: Settings → Clear All Data (with confirmation)

## 🎯 Key Features Explained

### Smart Notifications
- Automatic attendance warnings
- Task deadline reminders
- Study schedule notifications
- Achievement celebrations

### Attendance Analytics
- Subject-wise attendance percentage
- Monthly attendance trends
- Attendance heat maps
- Absence pattern analysis

### Task Management
- Priority levels (High, Medium, Low)
- Status tracking (Pending, In Progress, Completed)
- Due date management
- Task categorization

### Progress Visualization
- Line charts for progress over time
- Bar charts for subject comparison
- Goal completion tracking
- Achievement badges

## 🐛 Troubleshooting

### Common Issues

1. **Data not saving**: Check browser localStorage permissions
2. **Mobile zoom issues**: Ensure viewport meta tag is present
3. **Theme not applying**: Check system color preference settings
4. **Import/Export failing**: Validate JSON file format

### Performance Tips

- Use modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Clear localStorage if app becomes slow
- Export data regularly for backup
- Use desktop for better performance with large datasets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - Component primitives
- [Lucide](https://lucide.dev/) - Icon library
- [Vite](https://vitejs.dev/) - Build tool

## 📞 Support

If you encounter any issues or have suggestions:

1. Check existing [Issues](https://github.com/chinmaysevak/EduTracker0/issues)
2. Create a new issue with a detailed description
3. Include screenshots for UI issues
4. Specify browser and device information

---

**EduTrack** - Empowering students to achieve academic excellence 🎓
