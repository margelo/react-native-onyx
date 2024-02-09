# Benchmarks

> Rule 1: All metrics were captured with depth=1, length=35, items=10_000

> Rule 2: All operations were performed 10x times and then average value was calculated (sum / 10)

|Operation       |Baseline (mock storage)|IDB (current)|Local forge|SQLite (main)|SQLite (worker)|
|----------------|-----------------------|-------------|-----------|-------------|---------------|
|Single set      |115.9                  |157.8        |170.1      |155.4        |287.6          |
|Get collection  |10.39                  |9.46         |10.66      |9.55         |10.39          |
|Merge collection|365.7                  |619.8        |61338.8    |542.7        |600.8          |
|Single merge    |114.7                  |185.6        |192        |192.4        |311.2          |
|Clear           |99.08                  |982.7        |681        |166.4        |612            |
