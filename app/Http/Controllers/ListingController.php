<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Tag;
use App\Models\Type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ListingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $listings = Listing::with(['tags', 'type']);

        if ($request->has('search')) {
            $search = $request->get('search');
            $listings->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('author', 'like', "%{$search}%");
            });
        }


        return Inertia::render('Listings/index', [
            'listings' => $listings->orderBy('created_at', 'desc')->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Listings/create', [
            'availableTags' => Tag::orderBy('name')->get(),
            'availableTypes' => Type::orderBy('name')->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'author' => 'nullable|string|max:255',
            'type_id' => 'required|exists:types,id',
            'imageUrl' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id'
        ]);

        $tags = $validated['tags'] ?? [];

        DB::transaction(function () use ($validated, $tags) {
            $listing = Listing::create($validated);
            $listing->tags()->sync($tags);
        });

        return redirect()->route('listings.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Listing $listing)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Listing $listing)
    {
        return Inertia::render('Listings/edit', [
            'listing' => $listing->load(['tags', 'type']),
            'availableTags' => Tag::orderBy('name')->get(),
            'availableTypes' => Type::orderBy('name')->get()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Listing $listing)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'author' => 'nullable|string|max:255',
            'type_id' => 'required|exists:types,id',
            'imageUrl' => 'nullable|string|max:255',
            'link' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id'
        ]);

        $tags = $validated['tags'] ?? [];

        DB::transaction(function () use ($validated, $tags, $listing) {
            $listing->update($validated);
            $listing->tags()->sync($tags);
        });

        return redirect()->route('listings.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Listing $listing)
    {
        $listing->delete();
        return redirect()->route('listings.index');
    }

    public function bulkCreate()
    {
        return Inertia::render('Listings/bulk-create');
    }

    public function storeBulk(Request $request)
    {
        $request->validate([
            'listingsData' => 'required|string',
        ]);
    
        try {
            $listingsData = json_decode($request->listingsData, true);
    
            if (!is_array($listingsData)) {
                throw new \Exception('Invalid JSON format');
            }
    
            DB::transaction(function () use ($listingsData) {
                foreach ($listingsData as $key => $listingData) {
                    $validator = Validator::make($listingData, [
                        'name' => 'required|string|max:255',
                        'description' => 'nullable|string|max:1000',
                        'author' => 'nullable|string|max:255',
                        'type' => 'required|string', // Changed from type_id to type
                        'imageUrl' => 'nullable|string|max:255',
                        'link' => 'nullable|string|max:255',
                        'tags' => 'required|string', // Made tags required
                    ]);
    
                    if ($validator->fails()) {
                        throw new \Exception("Validation failed for listing at index {$key}: " . json_encode($validator->errors()->all()));
                    }
    
                    $validated = $validator->validated();
    
                    // Validate type exists
                    $type = Type::where('name', $validated['type'])->first();
                    if (!$type) {
                        throw new \Exception("Type '{$validated['type']}' does not exist for listing at index {$key}.");
                    }
    
                    $tagNames = array_map('trim', explode(',', $validated['tags']));
                    
                    // Validate all tags exist
                    $existingTags = Tag::whereIn('name', $tagNames)->pluck('name')->toArray();
                    $missingTags = array_diff($tagNames, $existingTags);
                    
                    if (!empty($missingTags)) {
                        throw new \Exception("The following tags do not exist for listing at index {$key}: " . implode(', ', $missingTags));
                    }
    
                    unset($validated['tags']);
                    unset($validated['type']);
    
                    $listing = Listing::create([
                        ...$validated,
                        'type_id' => $type->id,
                    ]);
    
                    // Attach existing tags
                    $tagIds = Tag::whereIn('name', $tagNames)->pluck('id')->toArray();
                    $listing->tags()->sync($tagIds);
                }
            });
    
            return redirect()->route('listings.index')
                             ->with('success', 'Listings created successfully!');
    
        } catch (\Exception $e) {
            return redirect()->back()
                             ->withErrors(['listingsData' => $e->getMessage()])
                             ->withInput();
        }
    }
}
