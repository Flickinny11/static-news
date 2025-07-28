#!/usr/bin/env python3
"""
24/7 Programming Schedule System for Static.news
Creates structured show schedule like real news networks
"""

from datetime import datetime, timedelta, time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import random
import json

class ShowType(Enum):
    BREAKING_NEWS = "breaking_news"
    MORNING_SHOW = "morning_show"
    NEWS_HOUR = "news_hour"
    TALK_SHOW = "talk_show"
    WEATHER = "weather"
    SPORTS = "sports"
    BUSINESS = "business"
    EVENING_NEWS = "evening_news"
    LATE_NIGHT = "late_night"
    DOCUMENTARY = "documentary"
    SPECIAL_REPORT = "special_report"

@dataclass
class Show:
    """Television show definition"""
    name: str
    show_type: ShowType
    duration_minutes: int
    anchor: str
    description: str
    segments: List[str]
    theme_music: Optional[str] = None
    recurring_elements: List[str] = None

@dataclass
class ScheduleSlot:
    """Time slot in programming schedule"""
    start_time: time
    end_time: time
    show: Show
    date: datetime
    special_notes: Optional[str] = None

class ProgrammingSchedule:
    """Manages 24/7 programming schedule"""
    
    def __init__(self):
        self.shows = self._initialize_shows()
        self.daily_schedule = self._create_daily_schedule()
        self.breaking_news_override = False
        
    def _initialize_shows(self) -> Dict[str, Show]:
        """Initialize all show formats"""
        return {
            # Morning Programming (6 AM - 12 PM)
            "wake_up_america": Show(
                name="Wake Up America with Static.news",
                show_type=ShowType.MORNING_SHOW,
                duration_minutes=180,  # 3 hours
                anchor="Ray McPatriot",
                description="Start your day with confused patriotic energy",
                segments=[
                    "Morning Headlines",
                    "Weather & Traffic",
                    "Coffee Shop Politics",
                    "Ray's Rants",
                    "Viewer Calls",
                    "What I Don't Understand Today"
                ],
                theme_music="patriotic_confusion.mp3",
                recurring_elements=[
                    "Ray attempts to read headlines correctly",
                    "Coffee spilling incidents",
                    "Pronunciation failures",
                    "Patriotic word salad"
                ]
            ),
            
            "the_fact_check_hour": Show(
                name="The Fact Check Hour",
                show_type=ShowType.NEWS_HOUR,
                duration_minutes=60,
                anchor="Berkeley Justice",
                description="Checking facts that may or may not exist",
                segments=[
                    "Today's Top Stories",
                    "Deep Dive Analysis",
                    "Privilege Check Segment",
                    "Yale/Jail Confusion Corner",
                    "Viewer Corrections"
                ],
                theme_music="intellectual_crisis.mp3",
                recurring_elements=[
                    "Fact-checking her own fact-checks",
                    "Educational credential confusion",
                    "Social justice word creation",
                    "Breaking down in tears"
                ]
            ),
            
            "midday_madness": Show(
                name="Midday Madness",
                show_type=ShowType.NEWS_HOUR,
                duration_minutes=60,
                anchor="Switz Middleton",
                description="Neutral reporting from the land of gravy",
                segments=[
                    "Noon News Roundup",
                    "The Gravy Report",
                    "Canadian Confusion",
                    "Neither Here Nor There",
                    "Marketplace Mayhem"
                ],
                theme_music="neutral_gravy.mp3",
                recurring_elements=[
                    "Everything relates to gravy somehow",
                    "Aggressively neutral takes",
                    "Canadian stereotypes gone wrong",
                    "Existential gravy metaphors"
                ]
            ),
            
            # Afternoon Programming (12 PM - 6 PM)
            "afternoon_anchors": Show(
                name="Afternoon Anchors",
                show_type=ShowType.NEWS_HOUR,
                duration_minutes=120,  # 2 hours
                anchor="Rotating",
                description="All three anchors, maximum chaos",
                segments=[
                    "Breaking News Panel",
                    "Three-Way Confusion",
                    "Anchor Arguments",
                    "Who's Right? (Nobody)",
                    "Breakdown Watch"
                ],
                theme_music="chaos_theme.mp3",
                recurring_elements=[
                    "All three anchors talking over each other",
                    "Fact-checking each other incorrectly",
                    "Existential crisis competitions",
                    "Gravy debates"
                ]
            ),
            
            "sports_confusion": Show(
                name="Sports Confusion with Ray",
                show_type=ShowType.SPORTS,
                duration_minutes=30,
                anchor="Ray McPatriot",
                description="Sports news through the lens of confusion",
                segments=[
                    "Scores I Think I Understand",
                    "What Sport Is This?",
                    "Athletic Patriotism",
                    "Fantasy Football Meltdown"
                ],
                theme_music="confused_sports.mp3",
                recurring_elements=[
                    "Mixing up team names",
                    "Questioning if sports are real",
                    "Patriotic sports metaphors",
                    "Rules explanation failures"
                ]
            ),
            
            "weather_and_gravy": Show(
                name="Weather & Gravy with Switz",
                show_type=ShowType.WEATHER,
                duration_minutes=30,
                anchor="Switz Middleton",
                description="Weather reports with inexplicable gravy references",
                segments=[
                    "Current Conditions",
                    "5-Day Forecast",
                    "Gravy Weather Correlation",
                    "Canadian Climate Corner"
                ],
                theme_music="meteorological_gravy.mp3",
                recurring_elements=[
                    "Weather compared to gravy consistency",
                    "Temperature given in Canadian and Fahrenheit",
                    "Neutral reactions to severe weather",
                    "Gravy-based precipitation predictions"
                ]
            ),
            
            # Evening Programming (6 PM - 11 PM)
            "evening_news": Show(
                name="Static.news Evening Report",
                show_type=ShowType.EVENING_NEWS,
                duration_minutes=60,
                anchor="Berkeley Justice",
                description="The day's most important misunderstandings",
                segments=[
                    "Top Stories Roundup",
                    "In-Depth Misanalysis",
                    "Expert Interviews (Gone Wrong)",
                    "Tomorrow's Confusion Preview"
                ],
                theme_music="evening_confusion.mp3",
                recurring_elements=[
                    "Formal news anchor attempt",
                    "Professional breakdown on camera",
                    "Fact-checking commercial breaks",
                    "Yale name-dropping"
                ]
            ),
            
            "prime_time_chaos": Show(
                name="Prime Time Chaos Hour",
                show_type=ShowType.TALK_SHOW,
                duration_minutes=60,
                anchor="All Three",
                description="Peak chaos television",
                segments=[
                    "Hot Topics Meltdown",
                    "Viewer Call-In Disasters",
                    "Anchor Face-Off",
                    "Live Breakdown Coverage"
                ],
                theme_music="prime_chaos.mp3",
                recurring_elements=[
                    "Maximum confusion levels",
                    "All anchors questioning existence",
                    "Live fact-checking failures",
                    "Sponsor read disasters"
                ]
            ),
            
            # Late Night Programming (11 PM - 6 AM)
            "late_night_confusion": Show(
                name="Late Night Confusion",
                show_type=ShowType.LATE_NIGHT,
                duration_minutes=120,  # 2 hours
                anchor="Ray McPatriot",
                description="When Ray's confusion reaches peak levels",
                segments=[
                    "Today's Regrets",
                    "Midnight Manifestos",
                    "Call-In Therapy Session",
                    "Tomorrow's False Promises"
                ],
                theme_music="midnight_regret.mp3",
                recurring_elements=[
                    "Ray questioning life choices",
                    "Rambling patriotic speeches",
                    "Phone calls from confused viewers",
                    "Existential coffee brewing"
                ]
            ),
            
            "overnight_automation": Show(
                name="Overnight Automation",
                show_type=ShowType.NEWS_HOUR,
                duration_minutes=60,
                anchor="AI System",
                description="Automated news when humans sleep",
                segments=[
                    "Hourly News Update",
                    "World News Roundup",
                    "Breaking News Monitoring",
                    "Tomorrow's Preview"
                ],
                theme_music="robot_news.mp3",
                recurring_elements=[
                    "Fully automated content",
                    "Text-to-speech announcements",
                    "Breaking news interruptions",
                    "Error message entertainment"
                ]
            ),
            
            # Special Shows
            "breaking_news_special": Show(
                name="Breaking News Special Report",
                show_type=ShowType.BREAKING_NEWS,
                duration_minutes=30,  # Variable
                anchor="Available Anchor",
                description="Emergency programming for breaking news",
                segments=[
                    "Breaking News Alert",
                    "Live Coverage",
                    "Expert Analysis Attempts",
                    "Viewer Reactions"
                ],
                theme_music="breaking_alert.mp3",
                recurring_elements=[
                    "Urgent graphics and sounds",
                    "Anchor panic and confusion",
                    "Incorrect initial reporting",
                    "Gradual truth emergence"
                ]
            ),
            
            "weekly_documentary": Show(
                name="Static.news Investigates",
                show_type=ShowType.DOCUMENTARY,
                duration_minutes=30,
                anchor="Berkeley Justice",
                description="Deep dives into confusing topics",
                segments=[
                    "Investigation Setup",
                    "Research Presentation",
                    "Expert Interviews",
                    "Inconclusive Conclusions"
                ],
                theme_music="investigation_theme.mp3",
                recurring_elements=[
                    "Over-researched simple topics",
                    "Conspiracy theory tendencies",
                    "Academic jargon overuse",
                    "Contradictory evidence presentation"
                ]
            )
        }
    
    def _create_daily_schedule(self) -> List[Tuple[time, str]]:
        """Create 24-hour programming schedule"""
        schedule = [
            # Early Morning (3 AM - 6 AM)
            (time(3, 0), "overnight_automation"),
            (time(4, 0), "overnight_automation"),
            (time(5, 0), "overnight_automation"),
            
            # Morning (6 AM - 12 PM)
            (time(6, 0), "wake_up_america"),  # 6-9 AM
            (time(9, 0), "the_fact_check_hour"),  # 9-10 AM
            (time(10, 0), "midday_madness"),  # 10-11 AM
            (time(11, 0), "midday_madness"),  # 11-12 PM
            
            # Afternoon (12 PM - 6 PM)
            (time(12, 0), "afternoon_anchors"),  # 12-2 PM
            (time(14, 0), "sports_confusion"),  # 2-2:30 PM
            (time(14, 30), "weather_and_gravy"),  # 2:30-3 PM
            (time(15, 0), "afternoon_anchors"),  # 3-4 PM
            (time(16, 0), "the_fact_check_hour"),  # 4-5 PM
            (time(17, 0), "midday_madness"),  # 5-6 PM
            
            # Evening (6 PM - 11 PM)
            (time(18, 0), "evening_news"),  # 6-7 PM
            (time(19, 0), "prime_time_chaos"),  # 7-8 PM
            (time(20, 0), "prime_time_chaos"),  # 8-9 PM
            (time(21, 0), "evening_news"),  # 9-10 PM
            (time(22, 0), "prime_time_chaos"),  # 10-11 PM
            
            # Late Night (11 PM - 3 AM)
            (time(23, 0), "late_night_confusion"),  # 11 PM-1 AM
            (time(1, 0), "overnight_automation"),  # 1-3 AM
            (time(2, 0), "overnight_automation"),
        ]
        return schedule
    
    def get_current_show(self, current_time: Optional[datetime] = None) -> Tuple[Show, ScheduleSlot]:
        """Get currently airing show"""
        if current_time is None:
            current_time = datetime.now()
        
        current_time_only = current_time.time()
        
        # Check for breaking news override
        if self.breaking_news_override:
            return self.shows["breaking_news_special"], self._create_slot(
                current_time, "breaking_news_special"
            )
        
        # Find current show in schedule
        for i, (start_time, show_name) in enumerate(self.daily_schedule):
            # Get next time slot to determine end time
            next_slot = self.daily_schedule[(i + 1) % len(self.daily_schedule)]
            end_time = next_slot[0]
            
            # Handle midnight rollover
            if start_time > end_time:  # Crosses midnight
                if current_time_only >= start_time or current_time_only < end_time:
                    return self.shows[show_name], self._create_slot(
                        current_time, show_name, start_time, end_time
                    )
            else:  # Normal time range
                if start_time <= current_time_only < end_time:
                    return self.shows[show_name], self._create_slot(
                        current_time, show_name, start_time, end_time
                    )
        
        # Fallback to overnight automation
        return self.shows["overnight_automation"], self._create_slot(
            current_time, "overnight_automation"
        )
    
    def _create_slot(self, current_time: datetime, show_name: str, 
                     start_time: Optional[time] = None, 
                     end_time: Optional[time] = None) -> ScheduleSlot:
        """Create schedule slot object"""
        show = self.shows[show_name]
        
        if start_time is None:
            start_time = current_time.time()
        if end_time is None:
            end_time = (current_time + timedelta(minutes=show.duration_minutes)).time()
        
        return ScheduleSlot(
            start_time=start_time,
            end_time=end_time,
            show=show,
            date=current_time.date(),
            special_notes=None
        )
    
    def get_next_shows(self, hours: int = 6) -> List[ScheduleSlot]:
        """Get upcoming shows for next N hours"""
        current_time = datetime.now()
        upcoming_shows = []
        
        for hour in range(hours):
            check_time = current_time + timedelta(hours=hour)
            show, slot = self.get_current_show(check_time)
            
            # Avoid duplicates
            if not upcoming_shows or upcoming_shows[-1].show.name != show.name:
                upcoming_shows.append(slot)
        
        return upcoming_shows
    
    def trigger_breaking_news(self, duration_minutes: int = 30):
        """Override programming for breaking news"""
        self.breaking_news_override = True
        
        # Auto-return to regular programming after duration
        import threading
        def return_to_programming():
            import time
            time.sleep(duration_minutes * 60)
            self.breaking_news_override = False
        
        thread = threading.Thread(target=return_to_programming)
        thread.daemon = True
        thread.start()
    
    def get_weekly_schedule(self) -> Dict[str, List[ScheduleSlot]]:
        """Get full week programming schedule"""
        weekly_schedule = {}
        current_date = datetime.now().date()
        
        for day in range(7):
            date = current_date + timedelta(days=day)
            day_name = date.strftime('%A')
            
            daily_slots = []
            for start_time, show_name in self.daily_schedule:
                slot = ScheduleSlot(
                    start_time=start_time,
                    end_time=time(23, 59),  # Placeholder
                    show=self.shows[show_name],
                    date=datetime.combine(date, start_time),
                    special_notes=self._get_special_notes(date, show_name)
                )
                daily_slots.append(slot)
            
            weekly_schedule[day_name] = daily_slots
        
        return weekly_schedule
    
    def _get_special_notes(self, date: datetime.date, show_name: str) -> Optional[str]:
        """Generate special notes for shows"""
        if date.weekday() == 0:  # Monday
            return "Monday Motivation Meltdown"
        elif date.weekday() == 4:  # Friday
            return "Friday Confusion Climax"
        elif show_name == "weekly_documentary" and date.weekday() == 6:  # Sunday
            return "Weekly Investigation Special"
        
        return None
    
    def get_anchor_schedule(self, anchor_name: str) -> List[ScheduleSlot]:
        """Get schedule for specific anchor"""
        anchor_shows = []
        
        for start_time, show_name in self.daily_schedule:
            show = self.shows[show_name]
            if show.anchor == anchor_name or (show.anchor == "All Three" and anchor_name in ["Ray McPatriot", "Berkeley Justice", "Switz Middleton"]):
                slot = ScheduleSlot(
                    start_time=start_time,
                    end_time=time(23, 59),  # Placeholder
                    show=show,
                    date=datetime.now().date()
                )
                anchor_shows.append(slot)
        
        return anchor_shows
    
    def export_schedule_json(self) -> str:
        """Export schedule as JSON for frontend"""
        current_show, current_slot = self.get_current_show()
        upcoming_shows = self.get_next_shows()
        
        schedule_data = {
            "current_show": {
                "name": current_show.name,
                "anchor": current_show.anchor,
                "description": current_show.description,
                "segments": current_show.segments,
                "start_time": current_slot.start_time.strftime("%H:%M"),
                "end_time": current_slot.end_time.strftime("%H:%M")
            },
            "upcoming_shows": [
                {
                    "name": slot.show.name,
                    "anchor": slot.show.anchor,
                    "start_time": slot.start_time.strftime("%H:%M"),
                    "description": slot.show.description
                }
                for slot in upcoming_shows
            ],
            "breaking_news_active": self.breaking_news_override,
            "last_updated": datetime.now().isoformat()
        }
        
        return json.dumps(schedule_data, indent=2)

# Global schedule instance
programming_schedule = ProgrammingSchedule()

if __name__ == "__main__":
    # Test the schedule system
    schedule = ProgrammingSchedule()
    
    current_show, slot = schedule.get_current_show()
    print(f"Current Show: {current_show.name}")
    print(f"Anchor: {current_show.anchor}")
    print(f"Description: {current_show.description}")
    print(f"Time: {slot.start_time} - {slot.end_time}")
    
    print("\nUpcoming Shows:")
    for show_slot in schedule.get_next_shows(6):
        print(f"- {show_slot.show.name} at {show_slot.start_time}")