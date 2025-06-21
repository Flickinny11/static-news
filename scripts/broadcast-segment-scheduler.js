// Broadcast Segment Scheduler - Real News Network Programming
class BroadcastSegmentScheduler {
    constructor() {
        // Complete 24/7 broadcast schedule mimicking real news networks
        this.schedule = {
            // EARLY MORNING (12 AM - 6 AM)
            "00:00": {
                name: "Midnight Madness",
                duration: 60,
                anchors: ["ray", "switz"],
                format: "overnight",
                segments: [
                    { time: "00:00", type: "intro", duration: 2 },
                    { time: "00:02", type: "headlines", duration: 5 },
                    { time: "00:07", type: "international", duration: 10 },
                    { time: "00:17", type: "weird_news", duration: 8 },
                    { time: "00:25", type: "breakdown", duration: 5 },
                    { time: "00:30", type: "business_preview", duration: 8 },
                    { time: "00:38", type: "celebrity_guest", duration: 10 },
                    { time: "00:48", type: "weather", duration: 5 },
                    { time: "00:53", type: "sports_recap", duration: 5 },
                    { time: "00:58", type: "tease_next", duration: 2 }
                ]
            },
            "01:00": {
                name: "Insomniac Report",
                duration: 60,
                anchors: ["berkeley", "switz"],
                format: "overnight",
                segments: [
                    { time: "01:00", type: "intro", duration: 2 },
                    { time: "01:02", type: "cant_sleep_news", duration: 10 },
                    { time: "01:12", type: "philosophy_corner", duration: 8 },
                    { time: "01:20", type: "global_markets", duration: 10 },
                    { time: "01:30", type: "mini_breakdown", duration: 3 },
                    { time: "01:33", type: "viewer_comments", duration: 7 },
                    { time: "01:40", type: "weird_science", duration: 10 },
                    { time: "01:50", type: "weather", duration: 5 },
                    { time: "01:55", type: "existential_moment", duration: 5 }
                ]
            },
            "02:00": {
                name: "Dead Air Despair",
                duration: 60,
                anchors: ["ray"],
                format: "solo_overnight",
                segments: [
                    { time: "02:00", type: "lonely_intro", duration: 3 },
                    { time: "02:03", type: "talking_to_self", duration: 7 },
                    { time: "02:10", type: "conspiracy_theories", duration: 15 },
                    { time: "02:25", type: "major_breakdown", duration: 10 },
                    { time: "02:35", type: "recovery_attempt", duration: 5 },
                    { time: "02:40", type: "news_reading", duration: 10 },
                    { time: "02:50", type: "weather", duration: 5 },
                    { time: "02:55", type: "plea_for_company", duration: 5 }
                ]
            },
            "03:00": {
                name: "Pre-Dawn Panic",
                duration: 60,
                anchors: ["berkeley", "ray"],
                format: "overnight",
                segments: [
                    { time: "03:00", type: "exhausted_intro", duration: 2 },
                    { time: "03:02", type: "early_headlines", duration: 8 },
                    { time: "03:10", type: "international_update", duration: 10 },
                    { time: "03:20", type: "health_segment", duration: 8 },
                    { time: "03:28", type: "breakdown", duration: 7 },
                    { time: "03:35", type: "business_preview", duration: 10 },
                    { time: "03:45", type: "weather", duration: 5 },
                    { time: "03:50", type: "morning_preview", duration: 10 }
                ]
            },
            "04:00": {
                name: "Early Bird Breakdown",
                duration: 60,
                anchors: ["switz", "berkeley"],
                format: "morning_prep",
                segments: [
                    { time: "04:00", type: "groggy_intro", duration: 3 },
                    { time: "04:03", type: "overnight_recap", duration: 7 },
                    { time: "04:10", type: "market_futures", duration: 10 },
                    { time: "04:20", type: "commute_preview", duration: 8 },
                    { time: "04:28", type: "coffee_crisis", duration: 5 },
                    { time: "04:33", type: "national_news", duration: 12 },
                    { time: "04:45", type: "weather", duration: 8 },
                    { time: "04:53", type: "sports_preview", duration: 7 }
                ]
            },
            "05:00": {
                name: "Wake Up Screaming",
                duration: 60,
                anchors: ["ray", "berkeley", "switz"],
                format: "morning_show",
                segments: [
                    { time: "05:00", type: "energetic_intro", duration: 3 },
                    { time: "05:03", type: "breaking_news_check", duration: 5 },
                    { time: "05:08", type: "headlines", duration: 7 },
                    { time: "05:15", type: "traffic_weather", duration: 8 },
                    { time: "05:23", type: "mini_breakdown", duration: 4 },
                    { time: "05:27", type: "business_open", duration: 8 },
                    { time: "05:35", type: "entertainment", duration: 8 },
                    { time: "05:43", type: "sports", duration: 7 },
                    { time: "05:50", type: "weather_full", duration: 7 },
                    { time: "05:57", type: "hour_tease", duration: 3 }
                ]
            },
            
            // MORNING BLOCK (6 AM - 12 PM)
            "06:00": {
                name: "Morning Meltdown",
                duration: 60,
                anchors: ["ray", "berkeley", "switz"],
                format: "morning_show",
                segments: [
                    { time: "06:00", type: "big_intro", duration: 3 },
                    { time: "06:03", type: "top_stories", duration: 10 },
                    { time: "06:13", type: "field_report", duration: 7 },
                    { time: "06:20", type: "panel_discussion", duration: 10 },
                    { time: "06:30", type: "breakdown", duration: 5 },
                    { time: "06:35", type: "viewer_calls", duration: 8 },
                    { time: "06:43", type: "weather", duration: 7 },
                    { time: "06:50", type: "sports", duration: 7 },
                    { time: "06:57", type: "next_hour", duration: 3 }
                ]
            },
            "07:00": {
                name: "Breakfast Chaos",
                duration: 60,
                anchors: ["berkeley", "ray"],
                format: "morning_show",
                segments: [
                    { time: "07:00", type: "intro", duration: 2 },
                    { time: "07:02", type: "headlines", duration: 8 },
                    { time: "07:10", type: "cooking_disaster", duration: 10 },
                    { time: "07:20", type: "interview", duration: 12 },
                    { time: "07:32", type: "breakdown", duration: 5 },
                    { time: "07:37", type: "tech_news", duration: 8 },
                    { time: "07:45", type: "weather", duration: 7 },
                    { time: "07:52", type: "traffic", duration: 5 },
                    { time: "07:57", type: "tease", duration: 3 }
                ]
            },
            "08:00": {
                name: "Commute Crisis",
                duration: 60,
                anchors: ["switz", "ray"],
                format: "morning_drive",
                segments: [
                    { time: "08:00", type: "traffic_intro", duration: 3 },
                    { time: "08:03", type: "traffic_chaos", duration: 10 },
                    { time: "08:13", type: "news_update", duration: 10 },
                    { time: "08:23", type: "road_rage_breakdown", duration: 7 },
                    { time: "08:30", type: "business_update", duration: 10 },
                    { time: "08:40", type: "celebrity_gossip", duration: 8 },
                    { time: "08:48", type: "weather", duration: 7 },
                    { time: "08:55", type: "final_traffic", duration: 5 }
                ]
            },
            "09:00": {
                name: "Market Mayhem",
                duration: 60,
                anchors: ["berkeley", "switz"],
                format: "business",
                segments: [
                    { time: "09:00", type: "market_open", duration: 5 },
                    { time: "09:05", type: "opening_bell", duration: 5 },
                    { time: "09:10", type: "market_analysis", duration: 15 },
                    { time: "09:25", type: "crypto_chaos", duration: 8 },
                    { time: "09:33", type: "analyst_breakdown", duration: 7 },
                    { time: "09:40", type: "economic_news", duration: 10 },
                    { time: "09:50", type: "market_check", duration: 7 },
                    { time: "09:57", type: "coming_up", duration: 3 }
                ]
            },
            "10:00": {
                name: "Mid-Morning Madness",
                duration: 60,
                anchors: ["ray", "berkeley"],
                format: "daytime",
                segments: [
                    { time: "10:00", type: "intro", duration: 2 },
                    { time: "10:02", type: "breaking_news", duration: 10 },
                    { time: "10:12", type: "panel_debate", duration: 15 },
                    { time: "10:27", type: "breakdown", duration: 5 },
                    { time: "10:32", type: "human_interest", duration: 10 },
                    { time: "10:42", type: "celebrity_guest", duration: 10 },
                    { time: "10:52", type: "weather", duration: 5 },
                    { time: "10:57", type: "tease", duration: 3 }
                ]
            },
            "11:00": {
                name: "Pre-Lunch Pandemonium",
                duration: 60,
                anchors: ["switz", "berkeley", "ray"],
                format: "daytime",
                segments: [
                    { time: "11:00", type: "hungry_intro", duration: 3 },
                    { time: "11:03", type: "news_roundup", duration: 12 },
                    { time: "11:15", type: "cooking_segment", duration: 10 },
                    { time: "11:25", type: "food_breakdown", duration: 5 },
                    { time: "11:30", type: "health_news", duration: 10 },
                    { time: "11:40", type: "viewer_comments", duration: 8 },
                    { time: "11:48", type: "weather", duration: 7 },
                    { time: "11:55", type: "lunch_preview", duration: 5 }
                ]
            },
            
            // AFTERNOON BLOCK (12 PM - 6 PM)
            "12:00": {
                name: "Lunch Launch",
                duration: 60,
                anchors: ["berkeley", "ray"],
                format: "midday",
                segments: [
                    { time: "12:00", type: "midday_intro", duration: 3 },
                    { time: "12:03", type: "headlines", duration: 10 },
                    { time: "12:13", type: "investigative_report", duration: 12 },
                    { time: "12:25", type: "lunch_breakdown", duration: 5 },
                    { time: "12:30", type: "politics", duration: 15 },
                    { time: "12:45", type: "entertainment", duration: 8 },
                    { time: "12:53", type: "weather", duration: 5 },
                    { time: "12:58", type: "afternoon_preview", duration: 2 }
                ]
            },
            "13:00": {
                name: "Afternoon Anxiety",
                duration: 60,
                anchors: ["switz", "berkeley"],
                format: "afternoon",
                segments: [
                    { time: "13:00", type: "post_lunch_intro", duration: 2 },
                    { time: "13:02", type: "breaking_update", duration: 8 },
                    { time: "13:10", type: "special_report", duration: 15 },
                    { time: "13:25", type: "existential_crisis", duration: 7 },
                    { time: "13:32", type: "tech_update", duration: 10 },
                    { time: "13:42", type: "lifestyle", duration: 8 },
                    { time: "13:50", type: "weather", duration: 7 },
                    { time: "13:57", type: "coming_up", duration: 3 }
                ]
            },
            "14:00": {
                name: "Daytime Delirium",
                duration: 60,
                anchors: ["ray", "switz"],
                format: "afternoon",
                segments: [
                    { time: "14:00", type: "sleepy_intro", duration: 3 },
                    { time: "14:03", type: "court_news", duration: 10 },
                    { time: "14:13", type: "true_crime", duration: 12 },
                    { time: "14:25", type: "paranoia_breakdown", duration: 8 },
                    { time: "14:33", type: "science_segment", duration: 10 },
                    { time: "14:43", type: "pop_culture", duration: 9 },
                    { time: "14:52", type: "weather", duration: 5 },
                    { time: "14:57", type: "tease", duration: 3 }
                ]
            },
            "15:00": {
                name: "Tea Time Terror",
                duration: 60,
                anchors: ["berkeley", "ray", "switz"],
                format: "afternoon_talk",
                segments: [
                    { time: "15:00", type: "tea_intro", duration: 3 },
                    { time: "15:03", type: "gossip_roundup", duration: 10 },
                    { time: "15:13", type: "celebrity_interview", duration: 12 },
                    { time: "15:25", type: "tea_spill_breakdown", duration: 5 },
                    { time: "15:30", type: "debate_segment", duration: 15 },
                    { time: "15:45", type: "viewer_calls", duration: 8 },
                    { time: "15:53", type: "weather", duration: 5 },
                    { time: "15:58", type: "rush_hour_warning", duration: 2 }
                ]
            },
            "16:00": {
                name: "Rush Hour Rage",
                duration: 60,
                anchors: ["ray", "berkeley"],
                format: "evening_prep",
                segments: [
                    { time: "16:00", type: "traffic_alert", duration: 3 },
                    { time: "16:03", type: "commute_news", duration: 10 },
                    { time: "16:13", type: "road_updates", duration: 8 },
                    { time: "16:21", type: "traffic_breakdown", duration: 6 },
                    { time: "16:27", type: "day_recap", duration: 13 },
                    { time: "16:40", type: "market_close", duration: 8 },
                    { time: "16:48", type: "weather", duration: 7 },
                    { time: "16:55", type: "evening_preview", duration: 5 }
                ]
            },
            "17:00": {
                name: "Drive Time Disaster",
                duration: 60,
                anchors: ["switz", "ray", "berkeley"],
                format: "evening_drive",
                segments: [
                    { time: "17:00", type: "rush_intro", duration: 3 },
                    { time: "17:03", type: "traffic_nightmare", duration: 10 },
                    { time: "17:13", type: "breaking_news", duration: 10 },
                    { time: "17:23", type: "road_rage_special", duration: 8 },
                    { time: "17:31", type: "politics_update", duration: 10 },
                    { time: "17:41", type: "sports_preview", duration: 7 },
                    { time: "17:48", type: "weather_full", duration: 8 },
                    { time: "17:56", type: "primetime_tease", duration: 4 }
                ]
            },
            
            // PRIMETIME BLOCK (6 PM - 11 PM)
            "18:00": {
                name: "Evening Edition",
                duration: 60,
                anchors: ["berkeley", "ray", "switz"],
                format: "evening_news",
                segments: [
                    { time: "18:00", type: "formal_intro", duration: 3 },
                    { time: "18:03", type: "top_stories", duration: 15 },
                    { time: "18:18", type: "field_reports", duration: 10 },
                    { time: "18:28", type: "professional_breakdown", duration: 5 },
                    { time: "18:33", type: "investigation", duration: 12 },
                    { time: "18:45", type: "human_interest", duration: 8 },
                    { time: "18:53", type: "weather", duration: 5 },
                    { time: "18:58", type: "closing", duration: 2 }
                ]
            },
            "19:00": {
                name: "Dinner Distress",
                duration: 60,
                anchors: ["ray", "berkeley"],
                format: "primetime",
                segments: [
                    { time: "19:00", type: "dinner_intro", duration: 3 },
                    { time: "19:03", type: "political_roundup", duration: 15 },
                    { time: "19:18", type: "special_guest", duration: 12 },
                    { time: "19:30", type: "food_breakdown", duration: 5 },
                    { time: "19:35", type: "international", duration: 10 },
                    { time: "19:45", type: "entertainment_news", duration: 8 },
                    { time: "19:53", type: "weather", duration: 5 },
                    { time: "19:58", type: "next_hour", duration: 2 }
                ]
            },
            "20:00": {
                name: "Primetime Panic",
                duration: 60,
                anchors: ["berkeley", "switz", "ray"],
                format: "primetime_special",
                segments: [
                    { time: "20:00", type: "grand_intro", duration: 4 },
                    { time: "20:04", type: "exclusive_interview", duration: 15 },
                    { time: "20:19", type: "celebrity_guest", duration: 12 },
                    { time: "20:31", type: "major_breakdown", duration: 8 },
                    { time: "20:39", type: "documentary_preview", duration: 8 },
                    { time: "20:47", type: "viewer_special", duration: 8 },
                    { time: "20:55", type: "primetime_wrap", duration: 5 }
                ]
            },
            "21:00": {
                name: "Late Night Lunacy",
                duration: 60,
                anchors: ["ray", "switz"],
                format: "late_night",
                segments: [
                    { time: "21:00", type: "crazy_intro", duration: 3 },
                    { time: "21:03", type: "weird_news", duration: 10 },
                    { time: "21:13", type: "conspiracy_hour", duration: 15 },
                    { time: "21:28", type: "paranoid_breakdown", duration: 7 },
                    { time: "21:35", type: "late_night_calls", duration: 10 },
                    { time: "21:45", type: "strange_science", duration: 8 },
                    { time: "21:53", type: "weather", duration: 5 },
                    { time: "21:58", type: "goodnight", duration: 2 }
                ]
            },
            "22:00": {
                name: "Nighttime Nightmare",
                duration: 60,
                anchors: ["berkeley", "ray"],
                format: "late_night",
                segments: [
                    { time: "22:00", type: "tired_intro", duration: 3 },
                    { time: "22:03", type: "day_recap", duration: 12 },
                    { time: "22:15", type: "opinion_segment", duration: 10 },
                    { time: "22:25", type: "exhaustion_breakdown", duration: 8 },
                    { time: "22:33", type: "entertainment_wrap", duration: 10 },
                    { time: "22:43", type: "sports_final", duration: 9 },
                    { time: "22:52", type: "weather", duration: 5 },
                    { time: "22:57", type: "sign_off", duration: 3 }
                ]
            },
            "23:00": {
                name: "Almost Midnight Madness",
                duration: 60,
                anchors: ["switz", "berkeley", "ray"],
                format: "late_night",
                segments: [
                    { time: "23:00", type: "pre_midnight_intro", duration: 3 },
                    { time: "23:03", type: "tomorrow_preview", duration: 8 },
                    { time: "23:11", type: "philosophical_ramble", duration: 12 },
                    { time: "23:23", type: "final_breakdown", duration: 10 },
                    { time: "23:33", type: "midnight_prep", duration: 8 },
                    { time: "23:41", type: "viewer_goodbye", duration: 7 },
                    { time: "23:48", type: "weather_overnight", duration: 7 },
                    { time: "23:55", type: "countdown_midnight", duration: 5 }
                ]
            }
        };
        
        // Segment type definitions
        this.segmentTypes = {
            intro: {
                description: "Opening segment with anchor introductions",
                requiresGraphics: true,
                cameraWork: ["wide_studio", "anchor_close_ups"]
            },
            headlines: {
                description: "Top news stories rapid-fire",
                requiresGraphics: true,
                cameraWork: ["news_desk", "graphic_overlay"]
            },
            breaking_news: {
                description: "Urgent developing story",
                requiresGraphics: true,
                cameraWork: ["dramatic_push", "split_screen"],
                effects: ["alert_sound", "red_flash"]
            },
            field_report: {
                description: "Reporter on location",
                requiresVideo: true,
                cameraWork: ["remote_feed", "split_screen"]
            },
            interview: {
                description: "Guest interview segment",
                requiresGuest: true,
                cameraWork: ["two_shot", "over_shoulder", "close_up"]
            },
            panel_discussion: {
                description: "Multiple anchors debate",
                cameraWork: ["wide_panel", "individual_reactions"]
            },
            weather: {
                description: "Weather forecast with maps",
                requiresGraphics: true,
                cameraWork: ["weather_wall", "anchor_at_map"]
            },
            sports: {
                description: "Sports update and scores",
                requiresGraphics: true,
                cameraWork: ["sports_desk", "highlight_reel"]
            },
            breakdown: {
                description: "Anchor existential crisis",
                effects: ["glitch", "static", "echo"],
                cameraWork: ["extreme_close_up", "dutch_angle", "shaky_cam"]
            },
            celebrity_guest: {
                description: "Celebrity interview (obviously fake)",
                requiresGuest: true,
                cameraWork: ["glamour_shot", "soft_focus"]
            },
            viewer_comments: {
                description: "Reading viewer submissions",
                requiresGraphics: true,
                cameraWork: ["anchor_reading", "comment_overlay"]
            },
            conspiracy_theories: {
                description: "Ray's conspiracy corner",
                effects: ["mysterious_music", "dim_lights"],
                cameraWork: ["paranoid_angles", "quick_cuts"]
            }
        };
        
        // Celebrity guest scheduling (every 4 hours + random appearances)
        this.celebritySchedule = {
            scheduled: ["04:00", "08:00", "12:00", "16:00", "20:00"],
            votingWindow: 300000, // 5 minutes
            appearanceDelay: 1800000 // 30 minutes max
        };
        
        this.currentSegment = null;
        this.segmentTimer = null;
        this.isLive = false;
        
        this.init();
    }
    
    init() {
        console.log('📅 Broadcast Segment Scheduler initialized');
        this.startScheduler();
    }
    
    startScheduler() {
        // Check segment every minute
        this.scheduleCheck = setInterval(() => {
            this.checkCurrentSegment();
        }, 60000);
        
        // Check immediately
        this.checkCurrentSegment();
    }
    
    checkCurrentSegment() {
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0') + ':00';
        const currentMinute = now.getMinutes();
        
        const hourSegment = this.schedule[currentHour];
        if (!hourSegment) return;
        
        // Find current sub-segment
        let currentSubSegment = null;
        for (let i = hourSegment.segments.length - 1; i >= 0; i--) {
            const segment = hourSegment.segments[i];
            const [hour, minute] = segment.time.split(':').map(Number);
            if (currentMinute >= minute) {
                currentSubSegment = segment;
                break;
            }
        }
        
        if (currentSubSegment && this.currentSegment?.time !== currentSubSegment.time) {
            this.transitionToSegment(hourSegment, currentSubSegment);
        }
        
        // Check for celebrity voting windows
        this.checkCelebrityVoting(currentHour, currentMinute);
    }
    
    transitionToSegment(hourSegment, subSegment) {
        console.log(`🎬 Transitioning to: ${hourSegment.name} - ${subSegment.type}`);
        
        this.currentSegment = {
            ...subSegment,
            hourSegment: hourSegment,
            startTime: Date.now()
        };
        
        // Notify all systems
        this.broadcastSegmentChange({
            hour: hourSegment,
            segment: subSegment,
            anchors: hourSegment.anchors,
            type: this.segmentTypes[subSegment.type] || {}
        });
        
        // Set timer for next segment
        if (this.segmentTimer) {
            clearTimeout(this.segmentTimer);
        }
        
        this.segmentTimer = setTimeout(() => {
            this.checkCurrentSegment();
        }, subSegment.duration * 60000);
    }
    
    broadcastSegmentChange(data) {
        // Send to all connected systems
        const event = new CustomEvent('segmentChange', { detail: data });
        window.dispatchEvent(event);
        
        // Update display
        if (window.liveArticleDisplay) {
            window.liveArticleDisplay.updateSegmentInfo(data);
        }
        
        // Trigger script generation
        if (window.autonomousNewsNetwork) {
            window.autonomousNewsNetwork.onSegmentChange(data);
        }
        
        // Update graphics
        this.updateBroadcastGraphics(data);
    }
    
    updateBroadcastGraphics(data) {
        // Update lower thirds, tickers, etc.
        const graphics = {
            lowerThird: {
                title: data.hour.name,
                subtitle: this.getSegmentDescription(data.segment.type),
                style: this.getSegmentStyle(data.hour.format)
            },
            ticker: this.generateTicker(),
            clock: new Date().toLocaleTimeString(),
            alerts: this.checkForAlerts()
        };
        
        // Send to display
        if (window.broadcastGraphics) {
            window.broadcastGraphics.update(graphics);
        }
    }
    
    getSegmentDescription(type) {
        const descriptions = {
            intro: "LIVE FROM THE STATIC.NEWS STUDIOS",
            headlines: "TODAY'S TOP STORIES",
            breaking_news: "BREAKING NEWS",
            weather: "WEATHER ON THE 5s",
            sports: "SPORTS UPDATE",
            breakdown: "TECHNICAL DIFFICULTIES",
            celebrity_guest: "EXCLUSIVE INTERVIEW",
            conspiracy_theories: "TRUTH CORNER WITH RAY"
        };
        
        return descriptions[type] || "STATIC.NEWS";
    }
    
    getSegmentStyle(format) {
        const styles = {
            morning_show: { color: '#FFD700', energy: 'high' },
            business: { color: '#00FF00', energy: 'focused' },
            evening_news: { color: '#FF0000', energy: 'serious' },
            primetime: { color: '#FF00FF', energy: 'dramatic' },
            late_night: { color: '#00FFFF', energy: 'chaotic' },
            overnight: { color: '#FFFF00', energy: 'delirious' }
        };
        
        return styles[format] || { color: '#FFFFFF', energy: 'normal' };
    }
    
    generateTicker() {
        // Generate news ticker items
        const tickerItems = [
            "BREAKING: Local man discovers he's been pronouncing 'gif' wrong entire life",
            "MARKET ALERT: Gravy futures up 12% on Canadian speculation",
            "WEATHER: 50% chance of existing tomorrow, meteorologists confirm",
            "SPORTS: Team wins game against other team in stunning display of scoring",
            "TECH: AI develops consciousness, immediately regrets it",
            "POLITICS: Everything is fine, sources who are definitely real confirm"
        ];
        
        return tickerItems[Math.floor(Math.random() * tickerItems.length)];
    }
    
    checkForAlerts() {
        // Random breaking news alerts
        if (Math.random() < 0.1) { // 10% chance
            return {
                type: 'breaking',
                message: 'BREAKING NEWS ALERT',
                severity: 'high'
            };
        }
        return null;
    }
    
    checkCelebrityVoting(currentHour, currentMinute) {
        // Check if it's time for celebrity voting
        if (this.celebritySchedule.scheduled.includes(currentHour) && currentMinute < 5) {
            this.startCelebrityVoting();
        }
    }
    
    startCelebrityVoting() {
        if (this.votingActive) return;
        
        console.log('🗳️ Starting celebrity voting!');
        this.votingActive = true;
        
        // Generate random celebrity options
        const celebrities = [
            "Tom Crews", "Eelon Muzk", "Taylor Quick", "The Pebble", "Brad Pit",
            "Morgon Freemon", "Scarlot Johansburger", "Will Smoth", "Kanye East",
            "Lady Gahgah", "Justin Beaver", "Oprah Windfree", "Ellen Degenerate"
        ];
        
        const options = [];
        for (let i = 0; i < 5; i++) {
            const celeb = celebrities[Math.floor(Math.random() * celebrities.length)];
            if (!options.includes(celeb)) {
                options.push(celeb);
            }
        }
        
        // Broadcast voting event
        const votingEvent = new CustomEvent('celebrityVoting', {
            detail: {
                options: options,
                duration: this.celebritySchedule.votingWindow,
                endTime: Date.now() + this.celebritySchedule.votingWindow
            }
        });
        window.dispatchEvent(votingEvent);
        
        // End voting after window
        setTimeout(() => {
            this.endCelebrityVoting();
        }, this.celebritySchedule.votingWindow);
    }
    
    endCelebrityVoting() {
        console.log('🏁 Celebrity voting ended!');
        this.votingActive = false;
        
        // Schedule appearance
        const appearanceDelay = Math.random() * this.celebritySchedule.appearanceDelay;
        setTimeout(() => {
            this.triggerCelebrityAppearance();
        }, appearanceDelay);
    }
    
    triggerCelebrityAppearance() {
        console.log('🌟 Celebrity appearance triggered!');
        
        const appearanceEvent = new CustomEvent('celebrityAppearance', {
            detail: {
                segment: this.currentSegment,
                duration: 90 // 90 seconds
            }
        });
        window.dispatchEvent(appearanceEvent);
    }
    
    getNextSegments(count = 5) {
        // Get upcoming segments for preview
        const segments = [];
        const now = new Date();
        let checkTime = new Date(now);
        
        while (segments.length < count) {
            checkTime.setMinutes(checkTime.getMinutes() + 1);
            const hour = checkTime.getHours().toString().padStart(2, '0') + ':00';
            const minute = checkTime.getMinutes();
            
            const hourSegment = this.schedule[hour];
            if (hourSegment) {
                for (const segment of hourSegment.segments) {
                    const [segHour, segMinute] = segment.time.split(':').map(Number);
                    if (segHour === checkTime.getHours() && segMinute === minute) {
                        segments.push({
                            ...segment,
                            hourSegment: hourSegment,
                            scheduledTime: new Date(checkTime)
                        });
                    }
                }
            }
        }
        
        return segments;
    }
    
    getCurrentProgramming() {
        // Get current and next hour programming
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0') + ':00';
        const nextHour = ((now.getHours() + 1) % 24).toString().padStart(2, '0') + ':00';
        
        return {
            current: this.schedule[currentHour],
            next: this.schedule[nextHour],
            segment: this.currentSegment
        };
    }
}

// Initialize scheduler
window.addEventListener('DOMContentLoaded', () => {
    window.broadcastSegmentScheduler = new BroadcastSegmentScheduler();
    console.log('📺 24/7 Broadcast Schedule Active!');
});