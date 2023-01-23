import random
import requests

def seed_data(n):
    vals = [1,2,3,4,5,6]
    for i in range(n):
        random.shuffle(vals)
        resp = post_ranks(name=random.choice(names)+random.choice(names),
                    ranks=gen_ranks(vals))

def post_ranks(name, ranks, ip='bullshit'):
    resp = requests.post('http://r.local/vote', data={'whoare':name, 'ip':ip, 'typea':get_ranks(ranks)})
    return resp

def gen_ranks(scores=range(1,7)): 
    ranks = dict(zip(scores,['Melancholia', 'Midsommar', '3 Women', 'Up', 'Dogville', 'The Brood']))
    return "\n".join(f"{k}: {v}" for k,v in ranks.items())
