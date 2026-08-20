package data

import (
    "log"
    "sort"
    "time"
)

// Start the automatic cycle rotation scheduler
func StartCycleScheduler() {
    go func() {
        log.Println("🔄 Cycle scheduler started - will rotate every Friday at midnight")
        
        for {
            now := time.Now()
            nextFriday := getNextFriday(now)
            duration := nextFriday.Sub(now)
            
            log.Printf("⏰ Next cycle rotation in %v (on %v)", duration.Round(time.Second), nextFriday.Format("Mon Jan 2 15:04:05"))
            
            time.Sleep(duration)
            
            log.Println("🔄 Saturday midnight reached - rotating cycles...")
            rotateCycles()
        }
    }()
}

func getNextFriday(now time.Time) time.Time {
    est, err := time.LoadLocation("America/New_York")
    if err != nil {
        log.Println("⚠️ Could not load EST timezone, using UTC")
        est = time.UTC
    }

    nowEST := now.In(est)

    // Target Saturday (6) — which is Friday night at midnight
    daysUntilSaturday := (6 - int(nowEST.Weekday()) + 7) % 7

    if daysUntilSaturday == 0 && (nowEST.Hour() > 0 || nowEST.Minute() > 0 || nowEST.Second() > 0) {
        daysUntilSaturday = 7
    }

    nextSaturday := nowEST.AddDate(0, 0, daysUntilSaturday)
    return time.Date(nextSaturday.Year(), nextSaturday.Month(), nextSaturday.Day(), 0, 0, 0, 0, est)
}

// Rotate to the next cycle in sequence
func rotateCycles() {
    cycles := GlobalStore.GetAllCycles()
    
    if len(cycles) == 0 {
        log.Println("⚠️ No cycles found")
        return
    }
    
    // Sort cycles by order
    sort.Slice(cycles, func(i, j int) bool {
        return cycles[i].Order < cycles[j].Order
    })
    
    // Find currently active cycle
    activeIndex := -1
    for i, cycle := range cycles {
        if cycle.IsActive {
            activeIndex = i
            break
        }
    }
    
    if activeIndex == -1 {
        log.Println("⚠️ No active cycle found - activating first cycle")
        cycles[0].IsActive = true
        cycles[0].ActivatedAt = time.Now().Format(time.RFC3339)
        GlobalStore.UpdateCycle(cycles[0].ID, UpdateCycleRequest{
            IsActive:    &cycles[0].IsActive,
            ActivatedAt: &cycles[0].ActivatedAt,
        })
    } else {
        // Deactivate current
        oldCycleName := cycles[activeIndex].Name
        isActiveFalse := false
        GlobalStore.UpdateCycle(cycles[activeIndex].ID, UpdateCycleRequest{
            IsActive: &isActiveFalse,
        })
        
        // Activate next (loop back to 0 if at the end)
        nextIndex := (activeIndex + 1) % len(cycles)
        isActiveTrue := true
        activatedAt := time.Now().Format(time.RFC3339)
        GlobalStore.UpdateCycle(cycles[nextIndex].ID, UpdateCycleRequest{
            IsActive:    &isActiveTrue,
            ActivatedAt: &activatedAt,
        })
        
        log.Printf("✅ Rotated from '%s' (order %d) to '%s' (order %d)", 
            oldCycleName, cycles[activeIndex].Order,
            cycles[nextIndex].Name, cycles[nextIndex].Order)
    }
}