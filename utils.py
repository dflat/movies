def group_by(data, key):
    grouped_data = {}
    for item in data:
        attr = getattr(item, key)
        if attr not in grouped_data:
            grouped_data[attr] = []
        grouped_data[attr].append(item)
    return grouped_data

def score_movie(raw_score, n_submissions, n_choices):
    """
    Returns a percent between 0 and 100 for how favored a film was
    based on rank choice voting algorithm.
    raw_score: raw vote-points a movie received (lower is better)
    n_submissions: number of voters/ submissions so far 
    n_choices: number of choices to rank
    """
    score = 1 - rescale(raw_score, mn=n_submissions, mx=n_submissions*n_choices)
    return round(100*score)

def rescale(x, mn, mx, a=0, b=1):
    return a + ((b-a)*(x-mn))/(mx-mn)